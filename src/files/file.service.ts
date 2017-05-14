import { Service } from '../util/inject';
import { FileVersion, StorageId } from './uploaded-file.model';
import { inject } from 'inversify';
import { STORAGE_STRATEGY, StorageStrategy } from './storage-strategy.interface';
import * as meter from 'stream-meter';

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
