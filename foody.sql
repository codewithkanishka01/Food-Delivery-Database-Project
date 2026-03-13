-- Database Setup
CREATE DATABASE IF NOT EXISTS food_delivery;
USE food_delivery;

-- Tables Cleanup 
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Orders, Menu, Restaurant, User;
SET FOREIGN_KEY_CHECKS = 1;

-- Tables Creation
CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE Restaurant (
    rest_id INT PRIMARY KEY AUTO_INCREMENT,
    rest_name VARCHAR(50),
    location VARCHAR(50)
);

CREATE TABLE Menu (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(50) UNIQUE NOT NULL,
    price DECIMAL(6,2) NOT NULL,
    rest_id INT,
    FOREIGN KEY (rest_id) REFERENCES Restaurant(rest_id)
);

CREATE TABLE Orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    item_id INT,
    quantity INT,
    total_price DECIMAL(8,2),
    order_date DATE,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (item_id) REFERENCES Menu(item_id)
);

-- Inserting Sample Data
INSERT INTO Restaurant (rest_name, location) VALUES 
('Spicy Hub', 'Delhi'),
('The Dessert Stop', 'Mumbai');

INSERT INTO Menu (item_name, price, rest_id) VALUES
('Burger', 120.00, 1),
('Pizza', 250.00, 1),
('Pasta', 200.00, 1),
('Sandwich', 90.00, 1),
('French Fries', 80.00, 1),
('Paneer Tikka', 220.00, 1),
('Veg Noodles', 150.00, 1),
('Chicken Biryani', 350.00, 1),
('Chocolate Brownie', 180.00, 2),
('Vanilla Ice Cream', 60.00, 2),
('Gulab Jamun', 50.00, 2),
('Cheesecake', 240.00, 2);