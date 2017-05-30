import { DatabaseStrategy } from '../database-strategy.interface';
import { Db, MongoClient } from 'mongodb';

export class MongodbDatabaseStrategy implements DatabaseStrategy {
  constructor() {
    MongoClient.connect('mongodb://localhost:27017/image-upload')
      .then((db: Db) => {
        console.log('Got DB', !!db);
      })
      .catch((err: any) => {
        console.error('Could not connect to DB', err);
      });
  }

  public create<T extends { id?: string }>(data: T): Promise<T> {
    return Promise.reject('Not implemented');
  }

  public update<T extends { id?: string }>(data: T): Promise<T> {
    return Promise.reject('Not implemented');
  }

  public retrieve<T extends { id?: string }>(id: string): Promise<T> {
    return Promise.reject('Not implemented');
  }
}
