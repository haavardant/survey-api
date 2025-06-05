# Survey API

A simple Express.js API to save and load survey configurations using PostgreSQL.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file:
   ```
   cp .env.example .env
   ```

3. Run the server:
   ```
   npm start
   ```

## Deploy to Railway

1. Push this project to GitHub.
2. Create a Railway project and deploy from GitHub.
3. Add the PostgreSQL plugin.
4. Set the `DATABASE_URL` in project variables.
5. Run the schema creation SQL in the database console:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  json JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```
