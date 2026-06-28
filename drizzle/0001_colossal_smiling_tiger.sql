PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_settings` (
	`user_id` text NOT NULL,
	`language_code` text NOT NULL,
	`timer_seconds` integer DEFAULT 10 NOT NULL,
	`card_direction` text DEFAULT 'random' NOT NULL,
	`show_romaji` integer DEFAULT true NOT NULL,
	PRIMARY KEY(`user_id`, `language_code`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_settings`("user_id", "language_code", "timer_seconds", "card_direction", "show_romaji") SELECT "user_id", "language_code", "timer_seconds", "card_direction", "show_romaji" FROM `user_settings`;--> statement-breakpoint
DROP TABLE `user_settings`;--> statement-breakpoint
ALTER TABLE `__new_user_settings` RENAME TO `user_settings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;