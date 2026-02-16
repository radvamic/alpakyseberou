CREATE TABLE `accommodations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '',
	`capacity` integer NOT NULL,
	`price_per_night` real NOT NULL,
	`total_units` integer NOT NULL,
	`image_url` text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`accommodation_id` integer NOT NULL,
	`guest_name` text NOT NULL,
	`guest_email` text NOT NULL,
	`check_in` text NOT NULL,
	`check_out` text NOT NULL,
	`guests` integer NOT NULL,
	`total_price` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`variable_symbol` text,
	`notes` text DEFAULT '',
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `guestbook_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`message` text NOT NULL,
	`is_public` integer DEFAULT true,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`guestbook_entry_id` integer,
	`name` text DEFAULT 'Anonym',
	`url` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`guestbook_entry_id`) REFERENCES `guestbook_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `questionnaire_responses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`questionnaire_id` integer NOT NULL,
	`respondent_name` text NOT NULL,
	`respondent_email` text DEFAULT '',
	`answers` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`questionnaire_id`) REFERENCES `questionnaires`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `questionnaires` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '',
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`questionnaire_id` integer NOT NULL,
	`text` text NOT NULL,
	`type` text NOT NULL,
	`options` text DEFAULT '',
	`required` integer DEFAULT false,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`questionnaire_id`) REFERENCES `questionnaires`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rsvps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text DEFAULT '',
	`attending` integer NOT NULL,
	`guests` integer DEFAULT 1,
	`children` integer DEFAULT false,
	`children_count` integer DEFAULT 0,
	`menu_preference` text DEFAULT '',
	`allergies` text DEFAULT '',
	`song_request` text DEFAULT '',
	`song_never` text DEFAULT '',
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
