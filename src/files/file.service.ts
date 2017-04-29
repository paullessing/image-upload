import { Provider } from '../util/inject';
import { DiskFileService } from './disk-file.service';
import { FileContent, FileId, UploadedFile } from './uploaded-file.model';

export const FileService = Symbol('FileService');

export interface FileService {
  getFile(id: FileId): Promise<UploadedFile>;
  storeFile(content: FileContent): Promise<UploadedFile>;
}

@Provider(FileService)
export class FileServiceProvider {

  public $provide(): FileService {
    // Default implementation
    return new DiskFileService();
  }
}
