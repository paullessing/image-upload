import { Config } from './config.interface';
import * as path from 'path';

export const defaultConfig: Config = {
  logLevel: 'debug',
  storage: {
    type: 'disk',
    dir: path.join(__dirname, '../../uploads')
  },
  database: {
    type: 'file',
    path: path.join(__dirname, '../../db.file')
  },
  imageSizes: [
    {
      name: 'thumbnail',
      width: 30,
      height: 30
    },
    {
      name: 'small',
      width: 640,
      height: 400
    },
    {
      name: 'medium',
      width: 1280,
      height: 800
    },
    {
      name: 'large',
      width: 1920,
      height: 1080
    },
    {
      name: 'huge',
      width: 3840,
      height: 2160
    }
  ]
};
