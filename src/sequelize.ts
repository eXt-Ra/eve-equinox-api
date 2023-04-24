import { Sequelize } from "sequelize-typescript";
import config from "./config/config";
import { SequelizeOptions } from "sequelize-typescript";


interface Config {
  development: SequelizeOptions;
  production: SequelizeOptions;
  [key: string]: SequelizeOptions;
}

const typedConfig = config as Config;
const env = (process.env.NODE_ENV as string) ?? "development";
const { username, password, database, host, dialect, models } = typedConfig[env];

const sequelize = new Sequelize(database ?? "", username ?? "", password, {
  host,
  dialect,
  models
});



export const setupSequelize = async () => {
  try {
    await sequelize.authenticate();
    console.log("🚀 postGres connected 🚀");
    // await sequelize.sync({ alter: true }).then(() => {
    //   console.log("Database schema updated");
    // }).catch((error) => {
    //   console.error("Error updating database schema:", error);
    // });
    console.log("🛠 postGres models synchronized successfully 🛠");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};


