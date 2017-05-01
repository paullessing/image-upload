import { DatabaseStrategy } from '../database-strategy.interface';
import uuid = require('uuid');

export class MemoryDatabaseStrategy implements DatabaseStrategy {
  private db = {};

  public create<T extends { id?: string }>(data: T): Promise<T> {
    const id = this.getUniqueId();
    const newData = {
      ...data,
      id
    };

    return Promise.resolve<T>(this.db[id] = newData);
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
