CREATE TABLE IF NOT EXISTS `camera_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL UNIQUE,
	`guest_name` text NOT NULL,
	`photos_taken` integer NOT NULL DEFAULT 0,
	`max_photos` integer NOT NULL DEFAULT 25,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `camera_photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL REFERENCES `camera_sessions`(`id`) ON DELETE CASCADE,
	`url` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
