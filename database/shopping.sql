-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 17, 2022 at 09:50 AM
-- Server version: 10.4.19-MariaDB
-- PHP Version: 8.0.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shopping`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `admin_name` varchar(255) NOT NULL,
  `admin_email` varchar(255) NOT NULL,
  `admin_pwd` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `admin_name`, `admin_email`, `admin_pwd`) VALUES
(1, 'Admin', 'admin@gmail.com', '$2b$10$jOxQDUtouSRBWNKnTTiUYemg1rB6WFBIUfkl8oMe/jBRQOaBMkOJa');

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `cart_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `prod_id` int(11) NOT NULL,
  `prod_qty` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`cart_id`, `user_id`, `prod_id`, `prod_qty`) VALUES
(5, 1, 8, 1);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `cat_id` int(11) NOT NULL,
  `cat_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`cat_id`, `cat_name`) VALUES
(8, 'Accessories'),
(9, 'Mobile Phones'),
(10, 'Laptops'),
(11, 'Television'),
(12, 'Camera'),
(13, 'Speakers');

-- --------------------------------------------------------

--
-- Table structure for table `deacts`
--

CREATE TABLE `deacts` (
  `d_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `d_remarks` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deacts`
--

INSERT INTO `deacts` (`d_id`, `user_id`, `d_remarks`) VALUES
(1, 1, 'This is a sample reason.');

-- --------------------------------------------------------

--
-- Table structure for table `featured`
--

CREATE TABLE `featured` (
  `f_id` int(11) NOT NULL,
  `prod_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `featured`
--

INSERT INTO `featured` (`f_id`, `prod_id`) VALUES
(8, 1),
(9, 2),
(10, 3),
(11, 5);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `prod_id` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `ship_addr` varchar(255) NOT NULL,
  `payment` int(11) NOT NULL,
  `order_date` varchar(255) NOT NULL,
  `ord_stat` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `prod_id`, `qty`, `ship_addr`, `payment`, `order_date`, `ord_stat`) VALUES
(1, 1, 2, 5, 'San Manuel, Pangasinan', 119995, '2022-02-10', 2),
(2, 1, 1, 5, 'San Manuel, Pangasinan', 11750, '2022-02-10', 1),
(3, 1, 8, 10, 'San Manuel, Pangasinan', 12340, '2022-02-10', 0),
(4, 1, 2, 5, 'Manaoag, Pangasinan', 119995, '2022-02-11', 0);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `prod_id` int(11) NOT NULL,
  `prod_img` varchar(255) NOT NULL,
  `prod_name` varchar(255) NOT NULL,
  `prod_qty` int(11) NOT NULL,
  `prod_price` int(11) NOT NULL,
  `prod_cat` varchar(255) NOT NULL,
  `prod_stat` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`prod_id`, `prod_img`, `prod_name`, `prod_qty`, `prod_price`, `prod_cat`, `prod_stat`) VALUES
(1, 'prod_img-1643524738579.jpg', 'Apple Watch Edit', 95, 2350, '8', 0),
(2, 'prod_img-1643524807103.jpg', 'Lenovo  Laptop', 50, 23999, '10', 0),
(3, 'prod_img-1643524836730.jpg', 'Camera V1', 0, 7899, '12', 0),
(5, 'prod_img-1643524892908.jpg', 'SAMSUNG Television', 50, 12999, '11', 0),
(6, 'prod_img-1643524942604.jpg', 'Samsung Smartphone', 20, 8999, '9', 0),
(7, 'prod_img-1643524968510.jpg', 'Camera 2', 25, 6799, '12', 0),
(8, 'prod_img-1643676250862.png', 'USB AIR CON', 20, 1234, '8', 0),
(9, 'prod_img-1644458540917.png', 'Sample Product Presentaion', 10, 12345, '8', 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` text NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `addr` varchar(255) NOT NULL,
  `account_stat` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `fullname`, `addr`, `account_stat`) VALUES
(1, 'adoramarkdenver@gmail.com', '$2b$10$FhOA9CHLX89qR891Xi6Hf.4mEZEuQVXSQjyF7GhQsPEQFZgtf8ss.', 'Mark Denver Adora', 'Manaoag, Pangasinan', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`cart_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`cat_id`);

--
-- Indexes for table `deacts`
--
ALTER TABLE `deacts`
  ADD PRIMARY KEY (`d_id`);

--
-- Indexes for table `featured`
--
ALTER TABLE `featured`
  ADD PRIMARY KEY (`f_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`prod_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `cat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `deacts`
--
ALTER TABLE `deacts`
  MODIFY `d_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `featured`
--
ALTER TABLE `featured`
  MODIFY `f_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `prod_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
