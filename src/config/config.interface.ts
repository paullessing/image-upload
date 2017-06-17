export const CONFIG = Symbol('Config');

export interface Config {
  logLevel: string;

  storageType: 'disk' | 'aws';
  diskStorage?: DiskStorageConfig;
  awsStorage?: AwsStorageConfig;

  databaseType: 'memory' | 'file' | 'mongodb';
  fileDatabase?: FileDatabaseConfig;
  mongoDatabase?: MongoDbConfig;

  imageSizes: ImageSizeConfig[];
}

export interface DiskStorageConfig {
  dir: string;
}

export interface AwsStorageConfig {
  path: string;
}

export interface FileDatabaseConfig {
  path: string;
}

export interface ImageSizeConfig {
  name: string;
  width: number;
  height: number;
}

export interface MongoDbConfig {
  url: string;
}
