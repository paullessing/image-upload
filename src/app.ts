import * as express from 'express';
import { createRouter } from 'express-router-decorators';
import * as morgan from 'morgan';
import * as winston from 'winston';
import * as fs from 'fs';
import { config } from './config/config';

import { Dependencies } from './util/inject';
import { ApiRouter } from './routers/api.router';

const hasEnvConfigPath = !!process.env.CONFIG_PATH;

// TODO load config from /var/config.json if no env variable is set and that file exists
if (hasEnvConfigPath) {
  try {
    const configPath = process.env.CONFIG_PATH;
    if (!fs.existsSync(configPath)) {
      console.error(`File does not exist: ${configPath}`);
      process.exit(1);
    }
    const extraConfig = fs.readFileSync(configPath).toString();
    if (!extraConfig.length) {
      console.error(`File is empty: ${configPath}`);
      process.exit(1);
    }

    Object.assign(config, JSON.parse(extraConfig));
  } catch (e) {
    console.error('Failed to load config', e);
    process.exit(1);
  }
}

const logLevel = config.logLevel || 'debug';
Object.assign(winston, { level: logLevel }); // Workaround because the typings file says this is readonly (but it isn't)

const app = express();

const container = Dependencies.createContainer(__dirname);
const router = createRouter(container.get(ApiRouter), { log: winston });

app.use((morgan as any as morgan.Morgan)('dev'));

app.use(router);
app.use('/*', (req, res) => res.sendStatus(404).end());

export {
  app
};
