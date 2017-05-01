import { Config } from './config.interface';

export const config: Config = {
  storageType: 'disk',
  diskStorage: {
    dir: '.'
  },
  databaseType: 'memory'
};
