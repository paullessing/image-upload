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

  public uploadFile(data: FileContent): Promise<UploadedFile> {
    const file = {
      content: data
    } as Partial<UploadedFile>;

    return this.storage.storeFile(data)
      .then((storageId) => {
        file.storageId = storageId;
        file.dateUploaded = moment();

        file.size = 0; // TODO
        file.mimeType = ''; // TODO

        return this.database.saveFile(file as UploadedFile);
      });
  }
}
