-- Insert Tony Stark into account table
INSERT INTO account 
(account_firstname, account_lastname, account_email, account_password) 
VALUES
('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Modify Tony Stark's account_type to 'Admin'
UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- Delete the Tony Stark record
DELETE FROM account
WHERE account_email = 'tony@starkent.com';

-- Modify "GM Hummer" description using REPLACE
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Inner join to get make, model, and classification name for "Sport" category
SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- Update image paths to include "/vehicles"
UPDATE inventory
SET
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
