import { Service } from '../util/inject';
import { FileId, UploadedFile } from '../interfaces/uploaded-file.model';
import { DATABASE_STRATEGY, DatabaseStrategy } from './database-strategy.interface';
import { inject } from 'inversify';
import * as moment from 'moment';
import { FileType } from '../interfaces/file-type.enum';

export interface StoredFile {
  id: string | null;
  fileType: string;

  dateUploaded: string;
  size: number;
  filename: string;
  storageId: string;
  mimetype: string;
}

@Service()
export class DatabaseService {
  constructor(
    @inject(DATABASE_STRATEGY) private database: DatabaseStrategy
  ) {}

  public saveFile(file: UploadedFile): Promise<UploadedFile> {
    const data: StoredFile = {
      id: file.id || null,
      fileType: file.fileType as FileType,
      dateUploaded: file.dateUploaded.toJSON(),
      size: file.size,
      filename: file.filename,
      storageId: file.storageId,
      mimetype: file.mimetype
    };

    return (file.id ? this.database.update(data) : this.database.create(data))
      .then((data: StoredFile) => ({
        ...file,
        id: data.id as string
      }));
  }

  public getFile(id: FileId): Promise<UploadedFile> {
    return this.database.retrieve<StoredFile>(id)
      .then((file) => {
        const uploadedFile: UploadedFile = {
          id: file.id,
          fileType: file.fileType as FileType,
          dateUploaded: moment(file.dateUploaded),
          size: file.size,
          filename: file.filename,
          storageId: file.storageId,
          mimetype: file.mimetype
        };

        return uploadedFile;
      });
  }
}
