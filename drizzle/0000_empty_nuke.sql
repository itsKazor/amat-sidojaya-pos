CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`category_id` integer,
	`vehicle_type` text,
	`brand` text,
	`stock` integer DEFAULT 0 NOT NULL,
	`min_stock` integer DEFAULT 5 NOT NULL,
	`purchase_price` integer DEFAULT 0 NOT NULL,
	`selling_price` integer DEFAULT 0 NOT NULL,
	`unit` text DEFAULT 'pcs' NOT NULL,
	`location` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_code_unique` ON `products` (`code`);--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`transaction_id` integer,
	`type` text NOT NULL,
	`quantity` integer NOT NULL,
	`stock_before` integer NOT NULL,
	`stock_after` integer NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transaction_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transaction_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` integer NOT NULL,
	`purchase_price_snapshot` integer DEFAULT 0 NOT NULL,
	`subtotal` integer NOT NULL,
	`profit` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_number` text NOT NULL,
	`type` text NOT NULL,
	`transaction_date` text NOT NULL,
	`total_amount` integer DEFAULT 0 NOT NULL,
	`total_profit` integer DEFAULT 0 NOT NULL,
	`customer_name` text,
	`supplier_name` text,
	`notes` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_invoice_number_unique` ON `transactions` (`invoice_number`);