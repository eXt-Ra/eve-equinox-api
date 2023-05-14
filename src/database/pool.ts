import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool, PoolConfig } from 'pg';
import config from './config';

interface Config {
  development: PoolConfig;
  test: PoolConfig;
  production: PoolConfig;
  [key: string]: PoolConfig;
}

const typedConfig: Config = config as Config;

export const pool = new Pool(typedConfig[process.env.NODE_ENV || 'development'] as PoolConfig);
export const db = drizzle(pool, { logger: true });

export const setupDrizzle = async () => {
  try {
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
