import { Service } from '../util/inject';
import { FileId, FileVersion, StorageId, UploadedFile } from './uploaded-file.model';
import { DatabaseService } from '../db/database.service';
import { inject } from 'inversify';
import { STORAGE_STRATEGY, StorageStrategy } from './storage-strategy.interface';
import * as moment from 'moment';
import { ImageSize, ImageSizes } from '../interfaces/image-sizes';
import * as meter from 'stream-meter';
import { FileTypeDetectingStream } from './file-type-detecting-stream';

@Service()
export class FileService {

  constructor(
    @inject(STORAGE_STRATEGY) private storage: StorageStrategy
  ) {
  }

  public uploadFile(data: NodeJS.ReadableStream, filename: string, version: string): Promise<FileVersion> {
    const size = meter();

    return this.storage.storeFile(data.pipe(size))
      .then((storageId: StorageId) => {
        const file: FileVersion = {
          // dateUploaded: moment(),
          // mimetype: mime.fileType.mime,
          // filename,
          key: version,
          size: size.bytes,
          storageId
        };

        return file;
      });
  }

  public uploadFileVersion(data: NodeJS.ReadableStream, file: UploadedFile, version: string): Promise<FileVersion> {
    const newFile = { ...file, versions: { ...file.versions } };
    const size = meter();

    return this.storage.storeFile(data.pipe(size))
      .then((storageId: StorageId) => {
        return {
          key: version,
          size: size.bytes,
          storageId
        };
      });
  }

  public getFile(storageId: StorageId): Promise<NodeJS.ReadableStream> {
    return this.storage.getFile(storageId);
  }
}
