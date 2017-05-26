import { FileContent, StorageId } from '../interfaces/uploaded-file.model';

export const STORAGE_STRATEGY = Symbol('StorageStrategy');

export interface StorageStrategy {
  getStream(id: StorageId): Promise<NodeJS.ReadableStream>;
  storeStream(content: NodeJS.ReadableStream): Promise<StorageId>;
  storeBuffer(content: Buffer): Promise<StorageId>;
}
