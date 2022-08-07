-- phpMyAdmin SQL Dump
-- version 5.0.4deb2ubuntu5
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 03, 2022 at 08:50 PM
-- Server version: 8.0.27-0ubuntu0.21.10.1
-- PHP Version: 7.3.28-1+ubuntu20.10.1+deb.sury.org+1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `e-com`
--

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`) VALUES
(21),
(22),
(23),
(35),
(36),
(37),
(38);

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `qty` int NOT NULL,
  `cart_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `product_id`, `qty`, `cart_id`) VALUES
(18, 11, 1, 21),
(48, 11, 1, 35),
(54, 11, 1, 37),
(55, 12, 1, 37),
(56, 9, 3, 38),
(57, 35, 1, 38),
(58, 36, 1, 38);

-- --------------------------------------------------------

--
-- Table structure for table `discount_codes`
--

CREATE TABLE `discount_codes` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `discount` float NOT NULL,
  `code` varchar(255) NOT NULL,
  `min_amount` float NOT NULL,
  `status` enum('Active','Revoked') NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf32;

--
-- Dumping data for table `discount_codes`
--

INSERT INTO `discount_codes` (`id`, `name`, `discount`, `code`, `min_amount`, `status`) VALUES
(1, 'Test', 1, 'test123', 100, 'Active'),
(2, 'HNY21', 21, 'HNY21', 2121, 'Active'),
(6, 'Rina', 2, '36394', 10, 'Active'),
(8, 'vfs', 2, 'rTj142', 10, 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `main_categories`
--

CREATE TABLE `main_categories` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32;

--
-- Dumping data for table `main_categories`
--

INSERT INTO `main_categories` (`id`, `name`) VALUES
(1, 'Grocery'),
(2, 'Women Cloths'),
(3, 'Bags'),
(4, 'Makeup');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int NOT NULL,
  `address` varchar(255) NOT NULL,
  `time` date NOT NULL,
  `pay_method` enum('COD') NOT NULL DEFAULT 'COD',
  `contact` varchar(255) NOT NULL,
  `status` enum('Delivered','Pending','Failed','In-progress','Assigned') CHARACTER SET utf32 COLLATE utf32_general_ci NOT NULL DEFAULT 'Pending',
  `cart_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `assigned_to` int DEFAULT NULL,
  `amount` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `address`, `time`, `pay_method`, `contact`, `status`, `cart_id`, `customer_id`, `assigned_to`, `amount`) VALUES
(20, 'Consectetur qui eiu', '2020-12-30', 'COD', '+2137454444', 'Pending', 21, 20, NULL, 586),
(49, 'Et commodo consequat', '2020-11-30', 'COD', '+233567890186', 'Pending', 35, 32, NULL, 601.702),
(51, 'Consectetur qui eiu', '2021-01-01', 'COD', '+2137454444', 'Assigned', 37, 20, 34, 1023.68),
(52, '315 W. 57TH STREET APT 7E', '2022-02-04', 'COD', '+8808887237489', 'Pending', 38, 36, NULL, 3565);

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `name`, `status`, `created_at`) VALUES
(1, 'Bkash', 1, '2021-10-20 13:01:42');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `unit` varchar(255) NOT NULL,
  `price` float NOT NULL,
  `sale_price` float NOT NULL,
  `discount` float NOT NULL,
  `qty` int NOT NULL,
  `main_category_id` int NOT NULL,
  `category_id` int NOT NULL,
  `image_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `unit`, `price`, `sale_price`, `discount`, `qty`, `main_category_id`, `category_id`, `image_name`) VALUES
(9, 'Mountain Trolley', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.', 'Pcs', 1000, 1200, 3, 44, 3, 16, 'h13_2_3.jpg_1608895335018'),
(10, 'Leather Trolley', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.', 'Pcs', 560, 600, 1, 48, 3, 16, '60226.jpg_1608895485282'),
(11, 'Silk Saree', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.', 'Pcs', 500, 600, 4, 35, 2, 15, 'wine-purple-silk-saree-with-banglori-silk-blouse-1-sarv01965.jpg_1608895561368'),
(12, 'Red Wedding Saree', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.', 'Pcs', 400, 444, 4, 7, 2, 15, 'unnamed.jpg_1608904397630'),
(13, 'Cocola Noodles', 'An old product', '10', 20, 24, 1, 5, 1, 18, 'mrnoodles-chicken-cup-noodles-40-gm.webp_1642095740294'),
(14, 'Nestle Maggi Masala Blast Noodles', '', '10', 140, 150, 0, 6, 1, 18, 'nestle-maggi-masala-blast-noodles-8-pack.webp_1642095983426'),
(15, 'Doodles Stick Noodles', '', '10', 15, 18, 0, 1, 1, 18, 'doodles-stick-noodles-180-gm.webp_1642096328558'),
(17, 'Mama Cup Noodles Shrimp', '', '1', 59, 60, 0, 1, 1, 18, 'mama-cup-noodles-shrimp-1-pcs.webp_1642096590178'),
(18, 'Ifad Eggy Instant Noodles Chicken (Buy 2 Get 1 Free)', '', '3', 138, 140, 0, 2, 1, 18, 'ifad-eggy-instant-noodles-chicken-buy-2-get-1-free-4-pcs.webp_1642096759571'),
(19, 'Doodles Masala Noodles (Free Box)', '', '2', 150, 160, 0, 2, 1, 18, 'doodles-masala-noodles-free-box-8-pack.webp_1642096825350'),
(20, 'Mama Noodles Tandoori Flavour 8 Pack', '', '1', 130, 135, 0, 1, 1, 18, 'mama-noodles-tandoori-flavour-8-pack-496-gm.webp_1642096932129'),
(21, 'Samyang Hot Chicken Ramen Curry Noodles', '', '1', 140, 142, 0, 4, 1, 18, 'samyang-hot-chicken-ramen-curry-noodles-140-gm.webp_1642097546682'),
(22, 'Doodles Instant Masala 248 gm (Free Box)', '', '1', 120, 125, 0, 1, 1, 18, 'doodles-instant-masala-248-gm-free-box-4-pcs.gif_1642097610724'),
(23, 'Prosperity Noodles Tomato', '', '2', 235, 239, 0, 1, 1, 18, 'prosperity-noodles-tomato-454-gm.webp_1642097687642'),
(24, 'Iffat Eggy Instant noodles', '', '1', 201, 205, 0, 1, 1, 18, 'ifad-eggy-instant-noodles-masala-buy-2-get-1-free-4-pcs.webp_1642098254196'),
(25, 'Masala noodles', '', '1', 125, 130, 0, 1, 1, 18, 'cocola-cook-masala-noodles-400-gm.webp_1642098356630'),
(26, 'noodles spicy', '', '1', 20, 25, 0, 1, 1, 18, 'samyang-hot-chicken-ramen-2x-spicy-cup-noodles-70-gm.webp_1642100403212'),
(27, 'onion', '', '1000', 50, 500, 0, 21, 1, 14, 'deshi-peyaj-local-onion-50-gm-1-kg.webp_1642100651907'),
(29, 'shosha', '', '20000', 28, 28, 0, 11111, 1, 14, 'deshi-shosha-local-cucumber-25-gm-500-gm.webp_1642101276131'),
(30, 'Borboti', '', '233', 30, 34, 0, 287, 1, 14, 'borboti-long-bean-25-gm-500-gm.webp_1642101429928'),
(31, 'capcicum', '', '3', 49, 60, 0, 1000, 1, 14, 'green-capsicum-15-gm-300-gm.webp_1642101499051'),
(32, 'Lal alu', '', '100', 20, 34, 0, 100000, 1, 14, 'lal-alu-red-potato-25-gm-500-gm.webp_1642101609061'),
(33, 'tomatoo', '', '100', 50, 60, 0, 10001, 1, 14, 'green-tomato-20-gm-500-gm.webp_1642146447896'),
(34, 'misti alu', '', '20', 20, 23, 0, 1000, 1, 14, 'misti-alu-sweet-potato-25-gm-500-gm.webp_1642146528943'),
(35, 'Fulkopi', '', '100', 30, 35, 0, 99, 1, 14, 'fulkopi-cauliflower-1-pcs.webp_1642146613639'),
(36, 'Boro alu', '', '20', 23, 28, 0, 99, 1, 14, 'boro-alu-big-diamond-potato-50-gm-1-kg.webp_1642146674448');

-- --------------------------------------------------------

--
-- Table structure for table `site_settings`
--

CREATE TABLE `site_settings` (
  `id` int NOT NULL,
  `logo_name` varchar(255) NOT NULL,
  `banner_name` varchar(255) NOT NULL,
  `footer` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32;

--
-- Dumping data for table `site_settings`
--

INSERT INTO `site_settings` (`id`, `logo_name`, `banner_name`, `footer`) VALUES
(4, 'logo_1642187595009.png', 'Banner.png_1642186741694', 'Copyright © 2022 CTG Bazaar All rights reserved.');

-- --------------------------------------------------------

--
-- Table structure for table `sub_categories`
--

CREATE TABLE `sub_categories` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `parent` int NOT NULL,
  `image_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32;

--
-- Dumping data for table `sub_categories`
--

INSERT INTO `sub_categories` (`id`, `name`, `slug`, `parent`, `image_name`) VALUES
(14, 'Vegetables', 'vegetables', 1, 'shopping-bag-full-of-fresh-vegetables-and-fruits-royalty-free-image-1128687123-1564523576.jpg_1608893960377'),
(15, 'Saree', 'saree', 2, '9c72693c4869583772f462a254ff9261.jpg_1608894170020'),
(16, 'Travel', 'travel', 3, 'HTB1YqkylcrI8KJjy0Fhq6zfnpXaQ.jpg_1608894354573'),
(18, 'Noodles', 'hand', 1, 'mrnoodles-chicken-cup-noodles-40-gm.webp_1642095432325');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `number` varchar(255) NOT NULL,
  `joining_date` date NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `type` enum('SA','DM','S','C') CHARACTER SET utf32 COLLATE utf32_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `address`, `password`, `code`, `number`, `joining_date`, `avatar`, `type`) VALUES
(1, 'Mr.', 'Admin', 'admin@admin.com', NULL, '$2b$10$5i/f0DPzMOj5eIib16V.cuACNucWEWPhu9oRXKSkHdhsRyKfG0t1C', '+880', '1633179767', '2020-12-06', 'download.png_1609354931348', 'SA'),
(2, 'Scarlett', 'Flowers', 'jyjaj@mailinator.com', NULL, '$2b$10$j23QK0Sgyb1kQiuZJTuQAOe6MpDpsffC/BHZ/3DIU15jMucp2Sv.C', '+63', '1747654321', '2020-12-17', NULL, 'S'),
(20, 'Naomi', 'Castro', 'customer@test.com', 'Consectetur qui eiu', '$2b$10$cHCNMVE8DC.A8GifLnmnsunJ09UTQC4NenVEquofJSDqOV/7HO916', '+213', '7454444', '2020-12-30', NULL, 'C'),
(32, 'Catherine', 'Alexander', 'cyfovy@mailinator.com', 'Et commodo consequat', '$2b$10$mxrJ1zBp6gk5E0B/wmzxnuWYt78A092FpEWQw8YbGEUtDmfZtQvA.', '+233', '567890186', '2020-12-31', NULL, 'C'),
(34, 'Shelli', 'Gimelstein', 'shhh@gmail.com', NULL, '$2b$10$j23QK0Sgyb1kQiuZJTuQAOe6MpDpsffC/BHZ/3DIU15jMucp2Sv.C', '+880', '01521483714', '2022-02-04', NULL, 'DM'),
(35, 'Shelli', 'Gimelstein2', 'sfdsdf@gmail.com', NULL, '$2b$10$j23QK0Sgyb1kQiuZJTuQAOe6MpDpsffC/BHZ/3DIU15jMucp2Sv.C', '+880', '01521483714', '2022-02-04', NULL, 'DM'),
(36, '315 W. 57TH STREET APT 7E', 'Gimelstein', 'sdfsfsfsfsdf@test.com', '315 W. 57TH STREET APT 7E', '$2b$10$usKdDDetQZIeIKXMXBAMYeiw3PamUZZbHuqF3dpf2SZJWSGLMvj3y', '+880', '8887237489', '2022-02-04', NULL, 'C');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_product_id` (`product_id`),
  ADD KEY `fk_cart_id` (`cart_id`);

--
-- Indexes for table `discount_codes`
--
ALTER TABLE `discount_codes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `main_categories`
--
ALTER TABLE `main_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_customer_id` (`customer_id`),
  ADD KEY `fk_customer_cart_id` (`cart_id`),
  ADD KEY `fk_orders_assigned_to_users_id` (`assigned_to`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`main_category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sub_categories`
--
ALTER TABLE `sub_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent` (`parent`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `discount_codes`
--
ALTER TABLE `discount_codes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `main_categories`
--
ALTER TABLE `main_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `site_settings`
--
ALTER TABLE `site_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sub_categories`
--
ALTER TABLE `sub_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cart_id` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_customer_cart_id` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_assigned_to_users_id` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`main_category_id`) REFERENCES `main_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `sub_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sub_categories`
--
ALTER TABLE `sub_categories`
  ADD CONSTRAINT `sub_categories_ibfk_1` FOREIGN KEY (`parent`) REFERENCES `main_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
