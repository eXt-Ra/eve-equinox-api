import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

export const pool = new Pool({
  port: 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
});

export const setupDrizzle = async () => {
  try {
    const db = drizzle(pool, { logger: true });
    // this will automatically run needed migrations on the database
    await migrate(db, { migrationsFolder: './src/migrations' }).then(() => {
      console.info("💡 postGres Database schema updated 💡");
    }).catch((error) => {
      console.error("🔌 Error updating database schema:", error);
    });
    console.info("🚀 postGres connected 🚀");
  } catch (error) {
    console.error("🔌 Unable to connect to the database :", error);
  }
};
