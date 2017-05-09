import { Service } from '../util/inject';
import { FileId, StorageId, UploadedFile } from '../files/uploaded-file.model';
import { DATABASE_STRATEGY, DatabaseStrategy } from './database-strategy.interface';
import { inject } from 'inversify';
import * as moment from 'moment';
import uuid = require('uuid');

interface StoredFile {
  id?: FileId;
  storageId: StorageId;
  dateUploaded: string;
  size: number;
  mimeType: string;
}

@Service()
export class DatabaseService {
  constructor(
    @inject(DATABASE_STRATEGY) private database: DatabaseStrategy
  ) {}

  public saveFile(file: UploadedFile): Promise<UploadedFile> {
    const data: StoredFile = {
      id: file.id,
      storageId: file.storageId as string,
      dateUploaded: file.dateUploaded.toJSON(),
      size: file.size,
      mimeType: file.mimetype
    };

    return this.database.create(data)
      .then((data: StoredFile) => ({
        ...file,
        id: data.id
      }));
  }

  public getFile(id: FileId): Promise<UploadedFile> {
    return this.database.retrieve<StoredFile>(id)
      .then((file) => {
        const uploadedFile: UploadedFile = {
          id: file.id,
          storageId: file.storageId,
          dateUploaded: moment(file.dateUploaded),
          size: file.size,
          mimetype: file.mimeType
        };

        return uploadedFile;
      });
  }
}
