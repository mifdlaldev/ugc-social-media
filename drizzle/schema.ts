import { sql } from 'drizzle-orm';
import {
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex
} from 'drizzle-orm/sqlite-core';

// ---- users (single pre-provisioned owner account) ----
export const users = sqliteTable(
	'users',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
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

// ---- posts (educational articles) ----
export const posts = sqliteTable(
	'posts',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		author_id: integer('author_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		title: text('title').notNull(),
		slug: text('slug').notNull().unique(),
		article_body: text('article_body').notNull(),
		excerpt: text('excerpt'),
		status: text('status', { enum: ['draft', 'published'] })
			.notNull()
			.default('draft'),
		created_at: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),
		updated_at: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),
		published_at: integer('published_at', { mode: 'timestamp' })
	},
	(table) => [
		index('posts_status_idx').on(table.status),
		index('posts_author_idx').on(table.author_id)
	]
);

// ---- categories (controlled taxonomy) ----
export const categories = sqliteTable(
	'categories',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		name: text('name').notNull().unique(),
		slug: text('slug').notNull().unique(),
		created_at: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [uniqueIndex('categories_slug_idx').on(table.slug)]
);

export const post_categories = sqliteTable(
	'post_categories',
	{
		post_id: integer('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		category_id: integer('category_id')
			.notNull()
			.references(() => categories.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.post_id, table.category_id] })]
);

// ---- tags (owner-controlled labels) ----
export const tags = sqliteTable(
	'tags',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		name: text('name').notNull().unique(),
		slug: text('slug').notNull().unique(),
		created_at: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [uniqueIndex('tags_slug_idx').on(table.slug)]
);

export const post_tags = sqliteTable(
	'post_tags',
	{
		post_id: integer('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		tag_id: integer('tag_id')
			.notNull()
			.references(() => tags.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.post_id, table.tag_id] })]
);

// ---- prompt_presets (owner-controlled visual intents) ----
export const prompt_presets = sqliteTable(
	'prompt_presets',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		name: text('name').notNull(),
		slug: text('slug').notNull().unique(),
		platform: text('platform').notNull(),
		aspect_ratio: text('aspect_ratio').notNull(), // e.g. "1:1", "9:16", "4:5"
		language: text('language').notNull().default('id'),
		visual_tone: text('visual_tone'),
		tool_notes: text('tool_notes', { mode: 'json' }).$type<Record<string, string>>(),
		is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
		sort_order: integer('sort_order').notNull().default(0),
		created_at: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),
		updated_at: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [index('presets_active_idx').on(table.is_active, table.sort_order)]
);

// ---- generation_attempts (one record per prompt-generation request) ----
export const generation_attempts = sqliteTable(
	'generation_attempts',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		post_id: integer('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		preset_id: integer('preset_id').references(() => prompt_presets.id, {
			onDelete: 'set null'
		}),
		input_hash: text('input_hash').notNull(),
		model_id: text('model_id').notNull(),
		preset_snapshot: text('preset_snapshot', { mode: 'json' }).$type<Record<string, unknown>>(),
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
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type PromptPreset = typeof prompt_presets.$inferSelect;
export type NewPromptPreset = typeof prompt_presets.$inferInsert;
export type GenerationAttempt = typeof generation_attempts.$inferSelect;
export type NewGenerationAttempt = typeof generation_attempts.$inferInsert;
