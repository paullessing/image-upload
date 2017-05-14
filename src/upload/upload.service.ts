import { Service } from '../util/inject';
import { FileId, FileVersion, UploadedFile } from '../files/uploaded-file.model';
import { DatabaseService } from '../db/database.service';
import { FileService } from '../files/file.service';
import { ImageSize, ImageSizes } from '../interfaces/image-sizes';
import { moment } from '../lib';
import { ImageService } from '../image/image.service';

export interface DownloadableFile {
  data: NodeJS.ReadableStream;
  size: number;
  mimetype: string;
}

export class FileNotFoundError extends Error {
  constructor(id: FileId) {
    super(`File with ID ${id} not found`); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}


@Service()
export class UploadService {

  constructor(
    private database: DatabaseService,
    private fileService: FileService,
    private imageService: ImageService
  ) {}

  public uploadImage(data: NodeJS.ReadableStream, filename: string): Promise<UploadedFile> {
    return this.fileService.uploadFile(data, filename, ImageSizes.ORIGINAL)
      .then((version: FileVersion) => {
        const file: UploadedFile = {
          dateUploaded: moment(),
          filename,
          versions: {
            [ImageSizes.ORIGINAL]: version,
          }
        };

        return file;
      })
      .then((file: UploadedFile) => {
        return this.database.saveFile(file);
      });
  }

  public getFile(id: FileId): Promise<UploadedFile> {
    return this.database.getFile(id)
      .then((file: UploadedFile) => {
        if (!file) {
          throw new FileNotFoundError(id);
        }
        return file;
      });
  }

  public getImageContents(id: FileId, size: ImageSize): Promise<DownloadableFile> {
    return this.getFile(id)
      .then((file: UploadedFile) => this.ensureImageSize(file, size))
      .then(([file, stream]: [UploadedFile, NodeJS.ReadableStream]) => ({
        data: stream,
        size: file.versions[size].size,
        mimetype: file.versions[size].mimetype
      }))
      .catch((e) => {
        console.error(e);
        throw e;
      });
  }

  private ensureImageSize(file: UploadedFile, size: ImageSize): Promise<[UploadedFile, NodeJS.ReadableStream]> {
    if (file.versions[size]) {
      return this.fileService.getFile(file.versions[size].storageId)
        .then((data: NodeJS.ReadableStream) => [file, data]);
    }
    return this.fileService.getFile(file.versions[ImageSizes.ORIGINAL].storageId)
      .then((data: NodeJS.ReadableStream) =>
        this.imageService.resize(data, size))
      .then((newData: NodeJS.ReadableStream) => {
        return this.fileService.uploadFileVersion(newData, size)
          .then((newVersion: FileVersion) => {
            const newVersions: { [key: string]: FileVersion } = { ...file.versions, [size]: newVersion };

            const newFile: UploadedFile = Object.assign({}, file, { versions: newVersions });
            return this.database.saveFile(newFile);
          })
          .then((newFile: UploadedFile) =>
            // TODO: This stores the file, then reads it from where it was stored, instead of reading from memory. It should return quickly.
            this.fileService.getFile(newFile.versions[size].storageId)
              .then((data: NodeJS.ReadableStream) => [newFile, data])
          );
      });
  }
}
