import { DatabaseStrategy } from '../database-strategy.interface';
import { Db, FindAndModifyWriteOpResultObject, InsertOneWriteOpResult, MongoClient } from 'mongodb';
import * as uuid from 'uuid';

export class MongodbDatabaseStrategy implements DatabaseStrategy {
  private db: Promise<Db>;

  constructor() {
  }

  public init(): void {
    console.log('Connecting to Mongodb');
    this.db = new Promise(async (resolve, reject) => {
      try {
        const db = await MongoClient.connect('mongodb://localhost:27017/image-upload');

        console.log('Connected to MongoDB');
        // TODO investigate, maybe
        // if (!(await db.collection('files').indexExists('id'))) {
        //   await db.collection('files').createIndex({ id: 1 }, {unique: true});
        // }

        resolve(db);

      } catch (e) {
        reject(e);
      }
    })

  }

  public async create<T extends { id?: string }>(data: T): Promise<T> {
    const db = await this.db;

    const dataToInsert: object = Object.assign({}, data, {
      id: uuid()
    });
    const dataToReturn: T = { ...dataToInsert } as T;

    const result: InsertOneWriteOpResult = await db.collection('files').insertOne(dataToInsert);

    if (result.insertedCount !== 1) {
      throw Error(`Unexpected insertion count ${result.insertedCount}`);
    }

    return dataToReturn;
  }

  public async update<T extends { id?: string }>(data: T): Promise<T> {
    const db = await this.db;

    const dataToInsert = Object.assign({}, data);

    const result: FindAndModifyWriteOpResultObject = await db.collection('files').findOneAndUpdate({
      id: data.id
    }, dataToInsert);

    if (!result.ok) {
      throw new Error(result.lastErrorObject);
    }

    return Object.assign({}, data, { id: data.id });
  }

  public async retrieve<T extends { id?: string }>(id: string): Promise<T> {
    if (!id) {
      return Promise.reject('Missing ID');
    }

    const db = await this.db;

    const result = await db.collection('files').findOne({ id });

    if (result._id) {
      delete result._id;
    }

    return result;
  }
}
