import { FileContent, StorageId } from './uploaded-file.model';

export const STORAGE_STRATEGY = Symbol('StorageStrategy');

export interface StorageStrategy {
  getFile(id: StorageId): Promise<FileContent>;
  storeFile(content: FileContent): Promise<StorageId>;
}
