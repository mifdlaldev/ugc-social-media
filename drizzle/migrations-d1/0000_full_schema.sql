CREATE TABLE `generation_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`input_hash` text NOT NULL,
	`model_id` text NOT NULL,
	`raw_output` text,
	`parsed_result` text,
	`status` text NOT NULL,
	`error_code` text,
	`error_message` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `attempts_post_idx` ON `generation_attempts` (`post_id`);--> statement-breakpoint
CREATE INDEX `attempts_created_idx` ON `generation_attempts` (`created_at`);--> statement-breakpoint
CREATE INDEX `attempts_status_idx` ON `generation_attempts` (`status`);--> statement-breakpoint
CREATE TABLE `post_research_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`source_url` text NOT NULL,
	`source_title` text,
	`source_snippet` text,
	`source_engine` text DEFAULT 'you.com' NOT NULL,
	`relevance_score` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `research_post_idx` ON `post_research_sources` (`post_id`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`topic` text NOT NULL,
	`platform_placement` text DEFAULT 'instagram-feed-portrait' NOT NULL,
	`visual_command` text DEFAULT '/infographic' NOT NULL,
	`slide_count` integer DEFAULT 5 NOT NULL,
	`excerpt` text,
	`style_lock` text,
	`style_lock_enabled` integer DEFAULT true NOT NULL,
	`post_status` text DEFAULT 'draft' NOT NULL,
	`posted_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `posts_author_idx` ON `posts` (`author_id`);--> statement-breakpoint
CREATE INDEX `posts_status_idx` ON `posts` (`post_status`);--> statement-breakpoint
CREATE INDEX `posts_created_idx` ON `posts` (`created_at`);--> statement-breakpoint
CREATE TABLE `prompt_slides` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`slide_index` integer NOT NULL,
	`slide_type` text DEFAULT 'custom' NOT NULL,
	`slide_title` text,
	`slide_subtitle` text,
	`slide_explanation` text,
	`visual_labels` text,
	`slide_takeaway` text,
	`research_context` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `slides_post_idx` ON `prompt_slides` (`post_id`);--> statement-breakpoint
CREATE INDEX `slides_index_idx` ON `prompt_slides` (`post_id`,`slide_index`);--> statement-breakpoint
CREATE TABLE `provider_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`slide_id` text NOT NULL,
	`provider` text NOT NULL,
	`prompt_text` text NOT NULL,
	`visual_notes` text,
	`on_image_text` text,
	`aspect_ratio` text DEFAULT '1:1' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`slide_id`) REFERENCES `prompt_slides`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `variants_slide_idx` ON `provider_variants` (`slide_id`);--> statement-breakpoint
CREATE INDEX `variants_provider_idx` ON `provider_variants` (`slide_id`,`provider`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `visual_command_recommendations` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`topic_snapshot` text NOT NULL,
	`model_id` text NOT NULL,
	`primary_command` text NOT NULL,
	`primary_reason` text NOT NULL,
	`alternatives` text,
	`per_slide` text,
	`raw_output` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `command_rec_post_idx` ON `visual_command_recommendations` (`post_id`);--> statement-breakpoint
CREATE INDEX `command_rec_created_idx` ON `visual_command_recommendations` (`created_at`);