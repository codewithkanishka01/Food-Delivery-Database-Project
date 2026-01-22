USE FoodDeliveryDB;

-- 1. Foreign key checks ko band karein taaki tables drop ho sakein
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Purani saari tables ko saaf (drop) karein
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS MenuItems;
DROP TABLE IF EXISTS FoodItems; -- Purani table ka naam
DROP TABLE IF EXISTS Restaurants;
DROP TABLE IF EXISTS Users;

-- 3. Foreign key checks ko wapas on karein
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- NAYA HUMANIZED STRUCTURE
-- =============================================

-- Users Table
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100),
    email_id VARCHAR(100) UNIQUE,
    home_address TEXT
);

-- Restaurants Table
CREATE TABLE Restaurants (
    res_id INT PRIMARY KEY AUTO_INCREMENT,
    res_name VARCHAR(100),
    food_type VARCHAR(50),
    rating DECIMAL(2,1)
);

-- MenuItems Table (Isme restaurant_id link hai)
CREATE TABLE MenuItems (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT,
    dish_name VARCHAR(100),
    price DECIMAL(10,2),
    FOREIGN KEY (restaurant_id) REFERENCES Restaurants(res_id)
);

-- Orders Table
CREATE TABLE Orders (
    order_no INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    res_id INT,
    bill_amount DECIMAL(10,2),
    order_status VARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (res_id) REFERENCES Restaurants(res_id)
);

-- 4. Sample Data Insert Karein
INSERT INTO Restaurants (res_name, food_type, rating) VALUES 
('Pizza Hut', 'Italian', 4.5),
('Burger King', 'Fast Food', 4.1),
('Sagar Ratna', 'South Indian', 4.7);

INSERT INTO Users (customer_name, email_id, home_address) VALUES 
('Rahul Singh', 'rahul@mail.com', 'Sector 15, Ghaziabad'),
('Anjali Verma', 'anjali@mail.com', 'Indirapuram, Ghaziabad');

INSERT INTO Orders (user_id, res_id, bill_amount, order_status) VALUES 
(1, 1, 450.00, 'Delivered'),
(2, 2, 200.00, 'Pending');

-- Final Result Dekhne ke liye
SELECT * FROM Restaurants;
SELECT * FROM Users;
SELECT * FROM Orders;
SELECT 
    o.order_no AS 'Bill No', 
    u.customer_name AS 'Customer Name', 
    r.res_name AS 'Ordered From', 
    o.bill_amount AS 'Price', 
    o.order_status AS 'Current Status'
FROM Orders o
JOIN Users u ON o.user_id = u.id
JOIN Restaurants r ON o.res_id = r.res_id;