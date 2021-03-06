import { DatabaseStrategy } from '../database-strategy.interface';
import uuid = require('uuid');

export class MemoryDatabaseStrategy implements DatabaseStrategy {
  private db: { [key: string]: any } = {};

  public create<T extends { id?: string }>(data: T): Promise<T> {
    const id = this.getUniqueId();
    const newData = Object.assign({}, data, { id });

    return Promise.resolve<T>(this.db[id] = newData);
  }

  public update<T extends { id?: string }>(data: T): Promise<T> {
    const newData = Object.assign({}, data);

    return Promise.resolve<T>(this.db[data.id as string] = newData);
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
}
