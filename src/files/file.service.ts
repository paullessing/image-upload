import { Service } from '../util/inject';
import { FileId, UploadedFile } from './uploaded-file.model';
import { DatabaseService } from '../db/database.service';
import { inject } from 'inversify';
import { STORAGE_STRATEGY, StorageStrategy } from './storage-strategy.interface';
import * as moment from 'moment';
import { ImageSize } from '../interfaces/image-sizes';
import { Transform } from 'stream';
import { SizeDetectingStream } from './size-detecting-stream';
import { FileTypeDetectingStream } from './file-type-detecting-stream';

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
    const sizeStream = new SizeDetectingStream();
    const fileTypeStream = new FileTypeDetectingStream();

    return this.storage.storeFile(data.pipe(sizeStream).pipe(fileTypeStream))
      .then((storageId) => {
        console.log('Data:', sizeStream.size, fileTypeStream.fileType);

        const file = {
          storageId,
          dateUploaded: moment(),
          size: sizeStream.size, // TODO this is wrong
          mimeType: fileTypeStream.fileType.mime // TODO do something with ext maybe?
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
