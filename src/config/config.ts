import { SequelizeOptions } from "sequelize-typescript";
import db from "../models";

const development: SequelizeOptions = {
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  dialect: "postgres",
  models: Object.values(db),
};

const production: SequelizeOptions = {
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  dialect: "postgres",
  models: Object.values(db),
};

export default {
  development,
  production,
};
