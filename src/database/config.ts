import { PoolConfig } from "pg";

const development: PoolConfig = {
  user: process.env.DEV_POSTGRES_USER,
  password: process.env.DEV_POSTGRES_PASSWORD,
  database: process.env.DEV_POSTGRES_DB,
  host: process.env.DEV_POSTGRES_HOST,
  port: 5432
};

const test: PoolConfig = {
  user: process.env.TEST_POSTGRES_USER,
  password: process.env.TEST_POSTGRES_PASSWORD,
  database: process.env.TEST_POSTGRES_DB,
  host: process.env.TEST_POSTGRES_HOST,
  port: 5432
};

const production: PoolConfig = {
  user: process.env.PROD_POSTGRES_USER,
  password: process.env.PROD_POSTGRES_PASSWORD,
  database: process.env.PROD_POSTGRES_DB,
  host: process.env.PROD_POSTGRES_HOST,
  port: 5432
};

export default {
  development,
  test,
  production,
};
