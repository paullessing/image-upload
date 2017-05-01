export interface Config {
  storageType: 'disk';
  diskStorage?: DiskStorageConfig;

  databaseType: 'memory' | 'file';
  fileDatabase?: FileDatabaseConfig;
}

export interface DiskStorageConfig {
  dir: string;
}

export interface FileDatabaseConfig {
  path: string;
}
