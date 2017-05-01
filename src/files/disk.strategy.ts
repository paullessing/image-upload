import * as uuid from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

import { FileContent, StorageId } from './uploaded-file.model';
import { DiskStorageConfig } from '../config';
import { StorageStrategy } from './storage-strategy.interface';

export class StoreToDiskStrategy implements StorageStrategy {

  constructor(
    private config: DiskStorageConfig
  ) {}

  public storeFile(content: NodeJS.ReadableStream): Promise<StorageId> {
    return this.getUniqueId()
      .then((id: string) => {
        const path = this.getPath(id);
        return new Promise((resolve, reject) => {
          const stream = fs.createWriteStream(path);

          content.on('end', () => {
            resolve(id);
          });
          content.on('error', (err: any) => {
            reject(err);
          });

          content.pipe(stream);
        });
      });
  }

  public getFile(id: StorageId): Promise<FileContent> {
    return Promise.reject('Not implemented');
  }

  private getUniqueId(): Promise<string> {
    const id = uuid();
    return Promise.resolve(this.getPath(id))
      .then((path: string) => new Promise((resolve, reject) => {
        fs.exists(path, (exists: boolean) => {
          if (!exists) {
            return resolve(id);
          } else {
            // Try again with a new UUID
            this.getUniqueId()
              .then(resolve, reject);
          }
        });
      }));
  }

  private getPath(id: StorageId): string {
    const r = path.join(this.config.dir, id);
    console.log('getPath', r);
    return r;
  }
}
