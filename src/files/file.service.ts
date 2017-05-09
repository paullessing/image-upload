import { Service } from '../util/inject';
import { FileId, UploadedFile } from './uploaded-file.model';
import { DatabaseService } from '../db/database.service';
import { inject } from 'inversify';
import { STORAGE_STRATEGY, StorageStrategy } from './storage-strategy.interface';
import * as moment from 'moment';
import { ImageSize, ImageSizes } from '../interfaces/image-sizes';
import * as meter from 'stream-meter';
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

  public uploadFile(data: NodeJS.ReadableStream, filename: string, mimetype: string): Promise<UploadedFile> {
    const size = meter();
    const mime = new FileTypeDetectingStream();

    return this.storage.storeFile(data.pipe(size).pipe(mime))
      .then((storageId) => {
        const file: UploadedFile = {
          storageId,
          dateUploaded: moment(),
          size: size.bytes,
          mimetype: mime.fileType.mime,
          filename,
          sizes: [ImageSizes.ORIGINAL]
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
