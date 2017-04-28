import * as express from 'express';
import {createRouter} from 'express-router-decorators';
import * as morgan from 'morgan';
import * as winston from 'winston';

import { Dependencies } from './util/inject';
import { ApiRouter } from './routers/api.router';

const app = express();

const container = Dependencies.createContainer(__dirname);
const router = createRouter(container.get(ApiRouter), { log: winston });

app.use(morgan('dev'));

app.use(router);
app.use('/*', (req, res) => res.send(404).end());

export {
  app
};
