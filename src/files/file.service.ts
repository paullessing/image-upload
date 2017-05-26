import { Service } from '../util/inject';
import { StorageId } from '../interfaces/uploaded-file.model';
import { inject } from 'inversify';
import { STORAGE_STRATEGY, StorageStrategy } from './storage-strategy.interface';

@Service()
export class FileService {

  constructor(
    @inject(STORAGE_STRATEGY) private storage: StorageStrategy
  ) {
  }

  public uploadFile(data: NodeJS.ReadableStream | Buffer): Promise<StorageId> {
    if (data instanceof Buffer) {
      return this.storage.storeBuffer(data);
    } else {
      return this.storage.storeStream(data as NodeJS.ReadableStream);
    }
      // .then((storageId: StorageId) => {
      //   // const file: FileVersion = {
      //   //   key: version,
      //   //   size: size.bytes,
      //   //   mimetype: mimeType.fileType.mime,
      //   //   storageId
      //   // };
      //
      //   return file;
      // });
  }

  public getFile(storageId: StorageId): Promise<NodeJS.ReadableStream> {
    return this.storage.getStream(storageId);
  }
}
