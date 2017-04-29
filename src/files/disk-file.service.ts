import { FileService } from './file.service';
import { FileContent, FileId, UploadedFile } from './uploaded-file.model';
import { Service } from '../util/inject';
import { DatabaseService } from '../db';

@Service()
export class DiskFileService implements FileService {

  constructor(
    private database: DatabaseService
  ) {}

  public storeFile(content: FileContent): Promise<UploadedFile> {
    return Promise.reject('Not implemented');
  }

  public getFile(id: FileId): Promise<UploadedFile> {
    return Promise.reject('Not implemented');
  }
}
