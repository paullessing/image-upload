import { Service } from '../util/inject';
import { FileContent, UploadedFile } from './uploaded-file.model';
import { DatabaseService } from '../db/database.service';
import { inject } from 'inversify';
import { STORAGE_STRATEGY, StorageStrategy } from './storage-strategy.interface';
import * as moment from 'moment';
import uuid = require('uuid');

@Service()
export class FileService {

  constructor(
    @inject(STORAGE_STRATEGY) private storage: StorageStrategy,
    private database: DatabaseService
  ) {
  }

  public uploadFile(data: NodeJS.ReadableStream): Promise<UploadedFile> {
    return this.storage.storeFile(data)
      .then((storageId) => {
        const file = {
          storageId,
          dateUploaded: moment(),
          size: 0, // TODO,
          mimeType: '' // TODO
        };

        return this.database.saveFile(file);
      });
  }
}
