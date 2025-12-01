import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Initializes PostgreSQL connection pool and exports Drizzle ORM client

dotenv.config();

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

export const db = drizzle(pool);
