import { sql } from 'drizzle-orm';
import { index, sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

/**
 * All primary keys are UUID v4 strings (not sequential integers) so that
 * identifiers exposed in URLs are unguessable and never collide.
 */
const uuid = () =>
	text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID());

// ---- users (single pre-provisioned owner account) ----
export const users = sqliteTable(
	'users',
	{
		id: uuid(),
		email: text('email').notNull().unique(),
		password_hash: text('password_hash').notNull(),
		role: text('role', { enum: ['owner', 'admin', 'user'] })
			.notNull()
			.default('user'),
		created_at: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),
		updated_at: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [uniqueIndex('users_email_idx').on(table.email)]
);

// ---- posts (social media posts) ----
export const posts = sqliteTable(
	'posts',
	{
		id: uuid(),
		author_id: text('author_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		topic: text('topic').notNull(), // max 200 char, e.g. "Bata merah vs bata ringan"
		/**
		 * Target image placement: platform + placement + exact canvas.
		 * Catalog and provenance: src/lib/catalog/platformPlacements.ts,
		 * sourced from docs/platform-image-size-reference.md.
		 */
		platform_placement: text('platform_placement', {
			enum: [
				'instagram-feed-square',
				'instagram-feed-portrait',
				'instagram-feed-landscape',
				'instagram-stories',
				'facebook-feed-square',
				'facebook-feed-portrait',
				'facebook-stories',
				'x-instream-single-image',
				'youtube-community-image',
				'linkedin-single-image-portrait',
				'linkedin-single-image-square',
				'linkedin-single-image-landscape',
				'pinterest-standard-pin'
			]
		})
			.notNull()
			.default('instagram-feed-portrait'),
		/**
		 * Selected visual form for the generated infographic.
		 * Catalog: src/lib/catalog/visualCommands.ts, sourced verbatim from
		 * docs/prompt-command-reference.md. A command selects form only and
		 * never licenses new engineering facts.
		 */
		visual_command: text('visual_command', {
			enum: [
				'/infographic',
				'/scientificdiagram',
				'/diagram',
				'/schematic',
				'/flowchart',
				'/process',
				'/comparison',
				'/timeline',
				'/conceptmap',
				'/anatomy',
				'/blueprint',
				'/isometric',
				'/explodedview',
				'/cutaway',
				'/crosssection',
				'/layers',
				'/scale',
				'/handwrittennotes'
			]
		})
			.notNull()
			.default('/infographic'),
		slide_count: integer('slide_count').notNull().default(5), // 3-7
		excerpt: text('excerpt'), // auto-generated from research, max 300 char
		/**
		 * Aesthetic-only style specification, reused verbatim by every slide of this
		 * post so a carousel stays visually consistent. NULL until the owner produces
		 * one. Holds medium, palette, typography, shape language, and background only;
		 * never engineering facts. See src/lib/server/styleLockService.ts.
		 */
		style_lock: text('style_lock'),
		/** Owner workflow state: has this been published to social media yet? */
		post_status: text('post_status', { enum: ['draft', 'posted'] })
			.notNull()
			.default('draft'),
		/** When the owner marked it as posted to social media. */
		posted_at: integer('posted_at', { mode: 'timestamp' }),
		created_at: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),
		updated_at: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [
		index('posts_author_idx').on(table.author_id),
		index('posts_status_idx').on(table.post_status),
		index('posts_created_idx').on(table.created_at)
	]
);

// ---- post_research_sources (research results per post) ----
export const post_research_sources = sqliteTable(
	'post_research_sources',
	{
		id: uuid(),
		post_id: text('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		source_url: text('source_url').notNull(),
		source_title: text('source_title'),
		source_snippet: text('source_snippet'),
		source_engine: text('source_engine').notNull().default('you.com'), // only you.com
		relevance_score: integer('relevance_score'), // 0-1000 (store as integer to avoid float issues)
		created_at: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [index('research_post_idx').on(table.post_id)]
);

// ---- prompt_slides (carousel slides per post) ----
export const prompt_slides = sqliteTable(
	'prompt_slides',
	{
		id: uuid(),
		post_id: text('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		slide_index: integer('slide_index').notNull(), // 0-based
		slide_type: text('slide_type', {
			enum: ['hook', 'problem', 'data', 'solution', 'cta', 'custom']
		})
			.notNull()
			.default('custom'),
		slide_title: text('slide_title'),
		/** Optional one-line scope, condition, or consequence. */
		slide_subtitle: text('slide_subtitle'),
		/**
		 * Short teaching explanation. Every factual statement must originate from
		 * approved research or the owner topic, with source qualifiers preserved.
		 */
		slide_explanation: text('slide_explanation'),
		/** Delimited list of labels for components, arrows, units, or stages shown. */
		visual_labels: text('visual_labels'),
		/** One concise transferable point. */
		slide_takeaway: text('slide_takeaway'),
		research_context: text('research_context'),
		created_at: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [
		index('slides_post_idx').on(table.post_id),
		index('slides_index_idx').on(table.post_id, table.slide_index)
	]
);

// ---- provider_variants (per-provider prompt per slide) ----
export const provider_variants = sqliteTable(
	'provider_variants',
	{
		id: uuid(),
		slide_id: text('slide_id')
			.notNull()
			.references(() => prompt_slides.id, { onDelete: 'cascade' }),
		provider: text('provider', { enum: ['gpt-image', 'nano-banana', 'recraft'] }).notNull(),
		prompt_text: text('prompt_text').notNull(),
		visual_notes: text('visual_notes'),
		on_image_text: text('on_image_text'),
		/**
		 * Target aspect ratio, taken from the post's selected placement catalog entry.
		 * Values cover every ratio present in src/lib/catalog/platformPlacements.ts.
		 */
		aspect_ratio: text('aspect_ratio', {
			enum: ['1:1', '9:16', '4:5', '1.91:1', '16:9', '2:3']
		})
			.notNull()
			.default('1:1'),
		created_at: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [
		index('variants_slide_idx').on(table.slide_id),
		index('variants_provider_idx').on(table.slide_id, table.provider)
	]
);

// ---- generation_attempts (one record per prompt-generation request) ----
export const generation_attempts = sqliteTable(
	'generation_attempts',
	{
		id: uuid(),
		post_id: text('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		input_hash: text('input_hash').notNull(),
		model_id: text('model_id').notNull(),
		raw_output: text('raw_output'),
		parsed_result: text('parsed_result', { mode: 'json' }).$type<unknown>(),
		status: text('status', {
			enum: ['success', 'failed', 'invalid', 'fidelity_rejected']
		}).notNull(),
		error_code: text('error_code'),
		error_message: text('error_message'),
		created_at: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [
		index('attempts_post_idx').on(table.post_id),
		index('attempts_created_idx').on(table.created_at),
		index('attempts_status_idx').on(table.status)
	]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostResearchSource = typeof post_research_sources.$inferSelect;
export type PromptSlide = typeof prompt_slides.$inferSelect;
export type ProviderVariant = typeof provider_variants.$inferSelect;
export type GenerationAttempt = typeof generation_attempts.$inferSelect;
export type NewGenerationAttempt = typeof generation_attempts.$inferInsert;
