ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;
-- Set lead as admin for testing (if email is known, otherwise manual)
UPDATE users SET is_admin = 1 WHERE email = 'lead@aurahealth.ng';
