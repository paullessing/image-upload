import { Service } from '../util/inject';
import { FileContent, FileId, UploadedFile } from './uploaded-file.model';
import { DatabaseService } from '../db/database.service';
import { inject } from 'inversify';
import { STORAGE_STRATEGY, StorageStrategy } from './storage-strategy.interface';
import * as moment from 'moment';
import uuid = require('uuid');
import { ImageSize } from '../interfaces/image-sizes';

class FileNotFoundError extends Error {
  constructor(id: FileId) {
    super(`File with ID ${id} not found`); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

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

  public getFile(id: FileId, size: ImageSize): Promise<NodeJS.ReadableStream> {
    // TODO do something clever with the size
    return this.database.getFile(id)
      .then((file: UploadedFile) => {
        if (!file) {
          throw new FileNotFoundError(id);
        }
        return this.storage.getFile(file.storageId as string);
      });
  }
}
