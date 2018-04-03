import * as uuid from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

import { StorageId } from '../interfaces/uploaded-file.model';
import { DiskStorageConfig } from '../config';
import { StorageStrategy } from './storage-strategy.interface';
import { sync as mkdirpSync } from 'mkdirp';

export class StoreToDiskStrategy implements StorageStrategy {

  constructor(
    private config: DiskStorageConfig
  ) {
    mkdirpSync(config.dir); // Ensure uploads directory exists
  }

  public async storeStream(content: NodeJS.ReadableStream): Promise<StorageId> {
    const id = await this.getUniqueId();
    const path = this.getPath(id);

    return new Promise<StorageId>((resolve, reject) => {
      try {
        const stream = fs.createWriteStream(path);

        content.on('end', () => {
          resolve(id);
        });
        content.on('error', (err: any) => {
          reject(err);
        });

        content.pipe(stream);
      } catch (e) {
        reject(e);
      }
    });
  }

  public async storeBuffer(data: Buffer): Promise<StorageId> {
    const id = await this.getUniqueId();
    const path = this.getPath(id);

    return new Promise<StorageId>((resolve, reject) => {
      try {
        fs.writeFile(path, data, (err) => {
          if (err) reject(err);
          resolve(id);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  public getStream(id: StorageId): Promise<NodeJS.ReadableStream> {
    const path = this.getPath(id);
    const stream = fs.createReadStream(path);
    return Promise.resolve(stream);
  }

  private getUniqueId(): Promise<string> {
    const id = uuid();
    return Promise.resolve<string>(this.getPath(id))
      .then((path: string) => new Promise<string>((resolve, reject) => {
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
    return path.join(this.config.dir, id);
  }
}
