CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  role TEXT DEFAULT 'user',
  created_at INTEGER NOT NULL,
  paystack_customer_id TEXT
);
