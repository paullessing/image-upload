import { Service } from '../util/inject';
import { FileId, UploadedFile } from '../interfaces/uploaded-file.model';
import { DATABASE_STRATEGY, DatabaseStrategy } from './database-strategy.interface';
import { inject } from 'inversify';
import * as moment from 'moment';
import { UploadedImage } from '../interfaces/uploaded-image.model';
import { FileTypes } from '../interfaces/file-type.enum';

@Service()
export class DatabaseService {
  constructor(
    @inject(DATABASE_STRATEGY) private database: DatabaseStrategy
  ) {}

  public async saveFile<T extends UploadedFile>(file: T): Promise<T> {
    const data: { id: string | null, [key: string]: any } = Object.assign({}, file, {
      id: file.id || null,
      dateUploaded: file.dateUploaded.toJSON()
    });

    const newFile = await (file.id ? this.database.update(data) : this.database.create(data));
    return Object.assign({}, file, {
      id: newFile.id as string
    }) as T;
  }

  public async getFile(id: FileId): Promise<UploadedFile> {
    const storedFile: UploadedFile = await this.database.retrieve<UploadedFile>(id);

    return Object.assign({}, storedFile, {
      dateUploaded: moment(storedFile.dateUploaded)
    }) as UploadedFile;
  }

  public async getImage(id: FileId): Promise<UploadedImage> {
    const storedFile: UploadedImage = await this.database.retrieve<UploadedImage>(id);

    if (storedFile.fileType !== FileTypes.IMAGE) {
      throw new Error(`File ${id} is not an image`);
    }

    return Object.assign({}, storedFile, {
      dateUploaded: moment(storedFile.dateUploaded)
    }) as UploadedImage;
  }
}
