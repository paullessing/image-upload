import { Config } from './config.interface';
import * as path from 'path';

export const config: Config = {
  storageType: 'disk',
  diskStorage: {
    dir: path.join(__dirname, '..')
  },
  databaseType: 'memory'
};
