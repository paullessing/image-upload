import { FileContent, StorageService } from './storage.service';

export class FileStorageService implements StorageService {

  public getFile(): Promise<File> {
    return undefined;
  }

  public storeFile(content: FileContent): Promise<File> {
    return undefined;
  }
}
