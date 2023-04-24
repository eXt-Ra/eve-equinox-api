/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/extensions */
require('ts-node/register');
require('dotenv').config()
const { development, production } = require('./config.ts').default;

module.exports = {
  development: {
    ...development,
    migrationStorageTableName: '_migrations',
  },
  production: {
    ...production,
    migrationStorageTableName: '_migrations',
  },
};
