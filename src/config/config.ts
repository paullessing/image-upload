import { Config } from './config.interface';
import * as path from 'path';

export const config: Config = {
  storageType: 'disk',
  diskStorage: {
    dir: path.join(__dirname, '../../uploads')
  },
  databaseType: 'file',
  fileDatabase: {
    path: path.join(__dirname, '../../db')
  },
  imageSizes: [
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
