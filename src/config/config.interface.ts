export const CONFIG = Symbol('Config');

export interface Config {
  storageType: 'disk';
  diskStorage?: DiskStorageConfig;

  databaseType: 'memory' | 'file';
  fileDatabase?: FileDatabaseConfig;

  imageSizes: ImageSizeConfig[];
}

export interface DiskStorageConfig {
  dir: string;
}

export interface FileDatabaseConfig {
  path: string;
}

export interface ImageSizeConfig {
  name: string;
  width: number;
  height: number;
}
