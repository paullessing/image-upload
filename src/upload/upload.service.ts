import { Service } from '../util/inject';
import {
  FileId, ImageMetadata, StorageId, UploadedFile,
} from '../interfaces/uploaded-file.model';
import { DatabaseService } from '../db/database.service';
import { FileService } from '../files/file.service';
import { moment } from '../lib';
import { ImageService } from '../image/image.service';
import { FileTypeDetectingStream } from '../files/file-type-detecting-stream';
import * as sharp from 'sharp';
import { FileTypes } from '../interfaces/file-type.enum';
import { BufferingStream } from './buffering-stream';
import { ResizedImage, UploadedImage } from '../interfaces/uploaded-image.model';

export interface DownloadableFile {
  data: NodeJS.ReadableStream | Buffer;
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

  public async uploadImage(data: NodeJS.ReadableStream, filename: string): Promise<UploadedFile> {
    const mimeType = new FileTypeDetectingStream();
    const toBuffer = new BufferingStream();

    const storageId: StorageId = await this.fileService.uploadFile(data.pipe(mimeType).pipe(toBuffer));
    const metadata = await sharp(toBuffer.buffer).metadata();

    const image: UploadedImage = {
      id: null,
      storageId,
      size: toBuffer.length,
      dateUploaded: moment(),
      filename,
      fileType: FileTypes.IMAGE,
      width: metadata.width as number,
      height: metadata.height as number,
      mimetype: mimeType.fileType.mime,
      sizes: {}
    };
    return this.database.saveFile(image);
  }

  public async getFile(id: FileId): Promise<UploadedFile> {
    const file = await this.database.getFile(id);
    if (!file) {
      throw new FileNotFoundError(id);
    }
    return file;
  }

  public async getImageContents(id: FileId, size: string | null): Promise<DownloadableFile> {
    const image: UploadedImage = await this.database.getImage(id);
    if (!image) {
      throw new FileNotFoundError(id);
    }
    if (size === null) {
      const data = await this.fileService.getFile(image.storageId);
      return {
        data,
        size: image.size,
        mimetype: image.mimetype
      };
    }

    const [resizedImage, data] = await this.ensureImageSize(image, size);
    return {
      data,
      size: resizedImage.size,
      mimetype: (resizedImage as ImageMetadata).mimetype
    };
  }

  private async ensureImageSize(image: UploadedImage, size: string): Promise<[ResizedImage, NodeJS.ReadableStream | Buffer]> {
    if (image.sizes[size]) {
      const data = await this.fileService.getFile(image.sizes[size].storageId);
      return [image.sizes[size], data];
    }

    const sourceImage = await this.fileService.getFile(image.storageId);
    const resizedImageData = await this.imageService.resize(sourceImage, image as ImageMetadata, size);

    const storageId = await this.fileService.uploadFile(resizedImageData.buffer);
    const resizedImage: ResizedImage = {
      height: resizedImageData.height,
      width: resizedImageData.width,
      mimetype: resizedImageData.mimetype,
      imageSize: size,
      size: resizedImageData.size,
      storageId
    };

    const newImage: UploadedImage = {
      ...image,
      sizes: {
        ...image.sizes,
        [size]: resizedImage
      }
    } as UploadedImage;

    await this.database.saveFile(newImage);
    return [resizedImage, resizedImageData.buffer];
  }
}
