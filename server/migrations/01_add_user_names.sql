-- Add firstName and lastName columns
ALTER TABLE users
ADD COLUMN firstName VARCHAR(50) AFTER name,
ADD COLUMN lastName VARCHAR(50) AFTER firstName;

-- Copy existing name into firstName (temporary solution)
UPDATE users SET 
firstName = SUBSTRING_INDEX(name, ' ', 1),
lastName = TRIM(SUBSTRING(name, LOCATE(' ', name)));

-- Drop the name column
ALTER TABLE users DROP COLUMN name;
