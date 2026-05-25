CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, plan TEXT DEFAULT 'free', created_at INTEGER NOT NULL, paystack_customer_id TEXT);
CREATE TABLE verifications (id TEXT PRIMARY KEY, user_id TEXT, drug_name TEXT, nafdac_number TEXT, status TEXT, timestamp INTEGER);
CREATE TABLE reports (id TEXT PRIMARY KEY, user_id TEXT, drug_name TEXT, reason TEXT, status TEXT DEFAULT 'pending', created_at INTEGER);
CREATE TABLE subscriptions (user_id TEXT PRIMARY KEY, plan TEXT, paystack_ref TEXT, expires_at INTEGER, active INTEGER);
