import { FileContent, StorageId } from '../interfaces/uploaded-file.model';

export const STORAGE_STRATEGY = Symbol('StorageStrategy');

export interface StorageStrategy {
  getFile(id: StorageId): Promise<NodeJS.ReadableStream>;
  storeFile(content: NodeJS.ReadableStream): Promise<StorageId>;
}
