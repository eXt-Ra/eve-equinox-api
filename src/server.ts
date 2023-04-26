import 'reflect-metadata';
import app from './app';
import config from './config';

app.listen(config.port, () => {
  console.info(`🚀 ${config.name} ${config.version} 🚀`);
  console.info(`🚀 Listening on ${config.port} with NODE_ENV=${config.nodeEnv} 🚀`);
});
