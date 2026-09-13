CREATE TABLE `quiz_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player_id` integer NOT NULL,
	`question_id` integer NOT NULL,
	`selected_option` integer NOT NULL,
	`answered_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `quiz_players`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_answers_player_question_unique` ON `quiz_answers` (`player_id`,`question_id`);--> statement-breakpoint
CREATE TABLE `quiz_players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`identity_key` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_players_token_unique` ON `quiz_players` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_players_identity_key_unique` ON `quiz_players` (`identity_key`);--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`number` integer NOT NULL,
	`image_url` text DEFAULT '' NOT NULL,
	`question_cs` text NOT NULL,
	`question_en` text DEFAULT '' NOT NULL,
	`options` text NOT NULL,
	`correct_option` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_questions_number_unique` ON `quiz_questions` (`number`);--> statement-breakpoint
ALTER TABLE `camera_sessions` ADD `guest_surname` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `camera_sessions` ADD `identity_key` text DEFAULT '' NOT NULL;--> statement-breakpoint
INSERT INTO `quiz_questions` (`number`, `image_url`, `question_cs`, `question_en`, `options`, `correct_option`) VALUES
(1, '/assets/images/kviz/q1.jpg', 'Proč šel Michal na střední školu do Kutné Hory, když pochází z Rakovníku?', 'Why did Michal go to high school in Kutná Hora when he comes from Rakovník?', '[{"cs":"v Kutné Hoře byl nejlepší cyklistický oddíl pro mladé talenty","en":"Kutná Hora had the best cycling team for young talents"},{"cs":"šel do Kutné Hory i jeho tehdy nejlepší kamarád","en":"his then-best friend went to Kutná Hora too"},{"cs":"bál se, že by z matiky v Rakovníku dostal za učitelku mamku","en":"he was afraid he would get his mom as his math teacher in Rakovník"}]', 2),
(2, '/assets/images/kviz/q2.jpg', 'Co je vrcholem Klárčiny atletické kariéry?', 'What is the peak of Klára''s athletic career?', '[{"cs":"zlatá medaile z MČR ve skoku o tyči","en":"a gold medal from the Czech National Championships in pole vault"},{"cs":"fotka s Jakobem Ingebrigtsenem","en":"a photo with Jakob Ingebrigtsen"},{"cs":"účast na mládežnickém mistrovství Evropy v běhu na 400 m","en":"participation in the European Youth Championships in the 400m run"}]', 0),
(3, '/assets/images/kviz/q3.jpg', 'Kolik mají Klárka s Michalem dohromady magisterských titulů (Ing./Mgr./MSc.)?', 'How many Master''s degrees (Ing./Mgr./MSc.) do Klára and Michal have combined?', '[{"cs":"3","en":"3"},{"cs":"4","en":"4"},{"cs":"5","en":"5"}]', 2),
(4, '/assets/images/kviz/q4.jpg', 'Díky komu se Klárka a Michal seznámili?', 'Thanks to whom did Klára and Michal meet?', '[{"cs":"díky svědkyni","en":"thanks to the maid of honor"},{"cs":"díky svědkovi","en":"thanks to the best man"},{"cs":"díky jedné z družiček","en":"thanks to one of the bridesmaids"}]', 1),
(5, '/assets/images/kviz/q5.jpg', 'Jaké oblečení měla na sobě Klárka v den, kdy se do ní Michal opravdicky zakoukal (a Klárka tohle oblečení má stále jako památku)?', 'What clothes was Klára wearing on the day Michal truly fell in love with her (and Klára still keeps these clothes as a keepsake)?', '[{"cs":"uplé džíny","en":"tight jeans"},{"cs":"mini šaty","en":"a mini dress"},{"cs":"červené plavky","en":"a red swimsuit"}]', 0),
(6, '/assets/images/kviz/q6.jpg', 'Kam vzal Michal Klárku na jejich první společné rande jím organizované?', 'Where did Michal take Klára on their first date organized by him?', '[{"cs":"do hornického dolu","en":"to a coal/mining pit"},{"cs":"na procházku s alpakami","en":"for a walk with alpacas"},{"cs":"na cyklovýlet v dešti","en":"on a bike trip in the rain"}]', 0),
(7, '/assets/images/kviz/q7.jpg', 'Kam vzala Klárka Michala na jejich první společné rande jí organizované?', 'Where did Klára take Michal on their first date organized by her?', '[{"cs":"do ZOO ve Dvoře Králové","en":"to the zoo in Dvůr Králové"},{"cs":"na Slovensko do Tatry (hory)","en":"to the Tatra Mountains in Slovakia"},{"cs":"na surfy do Francie","en":"surfing in France"}]', 2),
(8, '/assets/images/kviz/q8.jpg', 'Jak se jmenuje firma, kterou Michal s Klárkou založili?', 'What is the name of the company that Michal and Klára founded?', '[{"cs":"Softip","en":"Softip"},{"cs":"Soflexity","en":"Soflexity"},{"cs":"Sortes","en":"Sortes"}]', 1),
(9, '/assets/images/kviz/q9.jpg', 'Kolik zemí spolu Michal s Klárkou už navštívili?', 'How many countries have Michal and Klára visited together so far?', '[{"cs":"9","en":"9"},{"cs":"16","en":"16"},{"cs":"23","en":"23"}]', 1),
(10, '/assets/images/kviz/q10.jpg', 'Po kolika dnech vztahu požádal Michal Klárku o ruku?', 'After how many days of their relationship did Michal propose to Klára?', '[{"cs":"po 583 dnech","en":"after 583 days"},{"cs":"po 627 dnech","en":"after 627 days"},{"cs":"po 711 dnech","en":"after 711 days"}]', 0);