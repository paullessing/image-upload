import { Service } from '../util/inject';
import { FileVersion, StorageId } from '../interfaces/uploaded-file.model';
import { inject } from 'inversify';
import { STORAGE_STRATEGY, StorageStrategy } from './storage-strategy.interface';
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
    const mimeType = new FileTypeDetectingStream(); // TODO read the size using sharp() when storing an image. Images need a separate API

    return this.storage.storeFile(data.pipe(size).pipe(mimeType))
      .then((storageId: StorageId) => {
        const file: FileVersion = {
          key: version,
          size: size.bytes,
          mimetype: mimeType.fileType.mime,
          storageId
        };

        return file;
      });
  }

  public uploadFileVersion(data: NodeJS.ReadableStream, version: string): Promise<FileVersion> {
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
