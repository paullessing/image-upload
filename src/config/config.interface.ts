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
export function isDiskStorage(config: any): config is DiskStorageConfig {
  return config && config.hasOwnProperty('type') && config['type'] === 'disk';
}

export interface AwsStorageConfig {
  type: 'aws';
  path: string;
}
export function isAwsStorage(config: any): config is AwsStorageConfig {
  return config && config.hasOwnProperty('type') && config['type'] === 'aws';
}

export interface MemoryDatabaseConfig {
  type: 'memory';
}
export function isMemoryDatabase(config: any): config is MemoryDatabaseConfig {
  return config && config.hasOwnProperty('type') && config['type'] === 'memory';
}

export interface FileDatabaseConfig {
  type: 'file';
  path: string;
}
export function isFileDatabase(config: any): config is FileDatabaseConfig {
  return config && config.hasOwnProperty('type') && config['type'] === 'file';
}

export interface MongoDbConfig {
  type: 'mongodb';
  url: string;
}
export function isMongoDb(config: any): config is MongoDbConfig {
  return config && config.hasOwnProperty('type') && config['type'] === 'mongodb';
}

export interface ImageSizeConfig {
  name: string;
  width: number;
  height: number;
}

