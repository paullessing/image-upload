import { Service } from '../util/inject';
import { FileId, FileVersion, StorageId, UploadedFile } from '../files/uploaded-file.model';
import { DATABASE_STRATEGY, DatabaseStrategy } from './database-strategy.interface';
import { inject } from 'inversify';
import * as moment from 'moment';
import uuid = require('uuid');

interface StoredFile {
  id?: FileId;

  dateUploaded: string;
  filename: string;
  versions: {
    [key: string]: FileVersion
  };
}

@Service()
export class DatabaseService {
  constructor(
    @inject(DATABASE_STRATEGY) private database: DatabaseStrategy
  ) {}

  public saveFile(file: UploadedFile): Promise<UploadedFile> {
    const data: StoredFile = {
      id: file.id,
      dateUploaded: file.dateUploaded.toJSON(),
      filename: file.filename,
      versions: file.versions
    };

    return (file.id ? this.database.update(data) : this.database.create(data))
      .then((data: StoredFile) => ({
        ...file,
        id: data.id as string
      }));
  }

  public getFile(id: FileId): Promise<UploadedFile> {
    return this.database.retrieve<StoredFile>(id)
      .then((file) => {
        const uploadedFile: UploadedFile = {
          id: file.id,
          dateUploaded: moment(file.dateUploaded),
          filename: file.filename,
          versions: file.versions
        };

        return uploadedFile;
      });
  }
}
