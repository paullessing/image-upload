import * as express from 'express';
import { createRouter } from 'express-router-decorators';
import * as morgan from 'morgan';
import * as winston from 'winston';

import { Dependencies } from './util/inject';
import { ApiRouter } from './routers/api.router';
import { CONFIG, Config } from './config';

const container = Dependencies.createContainer(__dirname);
const config = container.get<Config>(CONFIG);

const logLevel = config.logLevel || 'warn';
Object.assign(winston, { level: logLevel }); // Workaround because the typings file says this is readonly (but it isn't)

const app = express();

const router = createRouter(container.get(ApiRouter), { log: winston });

app.use((morgan as any as morgan.Morgan)('dev'));

app.use(router);
app.use('/*', (req, res) => res.sendStatus(404).end());

export {
  app
};
