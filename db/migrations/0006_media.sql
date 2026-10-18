CREATE TABLE `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text NOT NULL,
	`guest_name` text NOT NULL,
	`guest_key` text NOT NULL,
	`device_hash` text NOT NULL,
	`fingerprint` text NOT NULL,
	`kind` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`part_size` integer NOT NULL,
	`original_key` text NOT NULL,
	`upload_id` text,
	`status` text DEFAULT 'uploading' NOT NULL,
	`thumb_key` text,
	`preview_key` text,
	`playback_key` text,
	`width` integer,
	`height` integer,
	`duration_ms` integer,
	`taken_at` text,
	`processing_error` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`locked_until` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`uploaded_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_uid_unique` ON `media` (`uid`);--> statement-breakpoint
CREATE UNIQUE INDEX `media_device_fingerprint_unique` ON `media` (`device_hash`,`fingerprint`);