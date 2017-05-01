import { DatabaseStrategy } from '../database-strategy.interface';
import { FileDatabaseConfig } from '../../config';
import * as fs from 'fs';
import * as uuid from 'uuid';

export class FilesystemDatabaseStrategy implements DatabaseStrategy {

  private db: { [key: string]: any } = {};

  constructor(
    private config: FileDatabaseConfig
  ) {
    this.readFromFile();
  }

  public create<T extends { id?: string } & object>(data: T): Promise<T> {
    const id = this.getUniqueId();
    const newData = Object.assign({}, data, { id });
    this.db[id] = newData;

    return this.flushToFile()
      .then(() => newData);
  }

  public retrieve<T extends { id?: string }>(id: string): Promise<T> {
    return Promise.resolve<T>(this.db[id]);
  }

  private getUniqueId(): string {
    let id;
    do {
      id = uuid();
    } while (this.db[id]);
    return id;
  }

  private flushToFile(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(this.config.path, JSON.stringify(this.db), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private readFromFile(): void {
    const path = this.config.path;
    if (fs.existsSync(path)) {
      this.db = JSON.parse(fs.readFileSync(path).toString());
    }
  }


}
