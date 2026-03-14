CREATE TABLE `photobooth_photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_name` text NOT NULL,
	`original_photo_url` text NOT NULL,
	`generated_photo_url` text NOT NULL,
	`category` text NOT NULL,
	`motif_id` text NOT NULL,
	`is_public` integer DEFAULT false,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
