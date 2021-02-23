-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 23, 2021 at 12:58 PM
-- Server version: 10.5.8-MariaDB
-- PHP Version: 8.0.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `payment`
--

-- --------------------------------------------------------

--
-- Table structure for table `pendings`
--

CREATE TABLE `pendings` (
  `id` int(10) NOT NULL,
  `trans_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(10) NOT NULL,
  `target_id` int(10) NOT NULL,
  `amount` int(20) NOT NULL,
  `type` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `info` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(10) NOT NULL,
  `trans_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(10) NOT NULL,
  `target_id` int(10) NOT NULL,
  `amount` int(20) NOT NULL,
  `type` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `info` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `trans_id`, `user_id`, `target_id`, `amount`, `type`, `info`, `status`, `created_at`, `updated_at`) VALUES
(16, 'TRANS-QRXIX66IL5', 3, 4, 10000, 'out', 'Dana Amal', 'Success', '2021-02-23 18:21:27', '2021-02-23 18:21:27'),
(17, 'TRANS-0XXPUINIT5', 3, 4, 20000, 'out', 'Dana Amal Lagi', 'Success', '2021-02-23 18:20:31', '2021-02-23 18:22:20'),
(18, 'TRANS-FK9ORT1FRG', 3, 3, 30000, 'in', 'TopUp Lagi', 'Success', '2021-02-23 18:22:50', '2021-02-23 18:22:50'),
(19, 'TRANS-8RJEY9BWL7', 3, 4, 20000, 'out', 'Dana Amal Lagi', 'Success', '2021-02-23 18:44:48', '2021-02-23 18:57:24'),
(20, 'TRANS-8F8YA91DSA', 3, 3, 1000000, 'in', 'Menang Gacha', 'Success', '2021-02-23 19:43:36', '2021-02-23 19:43:36'),
(21, 'TRANS-IP2JY90VKO', 3, 4, 100000, 'out', 'Dana Amal', 'Success', '2021-02-23 19:45:00', '2021-02-23 19:46:22');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) NOT NULL,
  `username` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `pin` int(6) DEFAULT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'default_photo.png',
  `email` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `handphone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '+62-',
  `credit` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `first_name`, `last_name`, `pin`, `password`, `image`, `email`, `handphone`, `credit`, `isActive`, `created_at`, `updated_at`) VALUES
(3, '', 'Alif', 'Maulana', NULL, '$2b$10$6.q5zniZEqyNP2X/d77dyeZ6sxPXnOQXTf1XRP25oa5QSR6oZIl0.', 'default_photo.png', 'alifmaulana26@gmail.com', NULL, 900000, 1, '2021-02-23 13:01:30', NULL),
(4, '', 'Avatar', 'Aang', NULL, '$2b$10$Z1mKjmAg0l3zLF9ZpPHaMert6dev8bhETZLzXbdvjLzoMkaT4fKK.', 'default_photo.png', 'aang@gmail.com', NULL, 105000, 1, '2021-02-23 13:57:38', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pendings`
--
ALTER TABLE `pendings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pendings`
--
ALTER TABLE `pendings`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pendings`
--
ALTER TABLE `pendings`
  ADD CONSTRAINT `userID` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
