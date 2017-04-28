import { Provider } from '../util/inject';
import { Stream } from 'stream';
import { Moment } from 'moment';
import { interfaces } from 'inversify';
import Factory = interfaces.Factory;
import { FileStorageService } from './file-storage.service';

export const STORE_SERVICE = Symbol('StorageService');

export type FileContent = string | Stream;

export interface File {
  content: FileContent;
  dateUploaded: Moment;
  size: number;
  mimeType: string;
}

export interface StorageService {
  getFile(): Promise<File>;
  storeFile(content: FileContent): Promise<File>;
}

@Provider(STORE_SERVICE)
export class StorageServiceProvider {

  public $provide(): StorageService {
    // Default implementation
    return new FileStorageService();
  }
}
