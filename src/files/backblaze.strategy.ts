import { StorageId } from '../interfaces/uploaded-file.model';
import { StorageStrategy } from './storage-strategy.interface';

export class UploadToBackblazeStrategy implements StorageStrategy {

  public storeStream(content: NodeJS.ReadableStream): Promise<StorageId> {
    return Promise.reject('Not implemented');
  }

  public async storeBuffer(data: Buffer): Promise<StorageId> {
    return Promise.reject('Not implemented');
  }

  public async getStream(id: StorageId): Promise<NodeJS.ReadableStream> {
    return Promise.reject('Not implemented');
  }
}
