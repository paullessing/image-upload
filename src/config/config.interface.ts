export const CONFIG = Symbol('Config');

export interface Config {
  logLevel: string;

  storage: DiskStorageConfig | AwsStorageConfig;
  database: FileDatabaseConfig | MemoryDatabaseConfig | MongoDbConfig;

  imageSizes: ImageSizeConfig[];
}

export interface DiskStorageConfig {
  type: 'disk';
  dir: string;
}

export interface AwsStorageConfig {
  type: 'aws';
  awsSettingsFile: string;
}

export interface MemoryDatabaseConfig {
  type: 'memory';
}

export interface FileDatabaseConfig {
  type: 'file';
  path: string;
}

export interface MongoDbConfig {
  type: 'mongodb';
  url: string;
}

export interface ImageSizeConfig {
  name: string;
  width: number;
  height: number;
}

