import { Service } from '../util/inject';
import {
  FileId, ImageMetadata, ResizedImage, StorageId, UploadedFile,
  UploadedImage
} from '../interfaces/uploaded-file.model';
import { DatabaseService } from '../db/database.service';
import { FileService } from '../files/file.service';
import { moment } from '../lib';
import { ImageService, ResizingStream } from '../image/image.service';
import { FileTypeDetectingStream } from '../files/file-type-detecting-stream';
import * as meter from 'stream-meter';
import * as sharp from 'sharp';
import { FileTypes } from '../interfaces/file-type.enum';

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
    const streamSize = meter();
    const mimeType = new FileTypeDetectingStream();
    let metadata: sharp.Metadata;
    const imageMetadata = sharp().metadata((error: any, _metadata: sharp.Metadata) => {
      metadata = _metadata;
    });

    return this.fileService.uploadFile(data.pipe(streamSize).pipe(mimeType).pipe(imageMetadata))
      .then((storageId: StorageId) => {
        const image: UploadedImage = {
          id: null,
          storageId,
          size: streamSize.bytes,
          dateUploaded: moment(),
          filename,
          fileType: FileTypes.IMAGE,
          width: metadata.width as number,
          height: metadata.height as number,
          mimetype: mimeType.fileType.mime,
          sizes: {}
        };

        return image;
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

  public getImageContents(id: FileId, size: string | null): Promise<DownloadableFile> {
    return this.getFile(id)
      .then((image: UploadedImage) => this.ensureImageSize(image, size))
      .then(([image, stream]: [UploadedImage, NodeJS.ReadableStream]) => {
        const imageData = (size ? image.sizes[size] : image);

        return {
          data: stream,
          size: imageData.size,
          mimetype: imageData.mimetype
        };
      })
      .catch((e) => {
        console.error(e);
        throw e;
      });
  }

  private ensureImageSize(image: UploadedImage, size: string | null): Promise<[UploadedImage, NodeJS.ReadableStream]> {
    // Original size
    if (!size) {
      return this.fileService.getFile(image.storageId)
        .then((data: NodeJS.ReadableStream) => [image, data]);
    }

    // Size already exists
    if (image.sizes[size]) {
      return this.fileService.getFile(image.sizes[size].storageId)
        .then((data: NodeJS.ReadableStream) => [image, data]);
    }

    // Need to resize
    return this.fileService.getFile(image.storageId)
      .then((data: NodeJS.ReadableStream) =>
        this.imageService.resize(data, size))
      .then((newStream: ResizingStream) => {
        const streamSize = meter();
        const mimeType = new FileTypeDetectingStream(); // TODO read the size using sharp() when storing an image. Images need a separate API

        return this.fileService.uploadFile(newStream.stream.pipe(streamSize).pipe(mimeType))
          .then((id: StorageId) => {
            const resizedImage: ResizedImage = {
              width: newStream.width,
              height: newStream.height,
              mimetype: newStream.mimetype,
              storageId: id,
              imageSize: size,
              size: streamSize.bytes
            };
            const newSizes = Object.assign({}, image.sizes, { [size]: resizedImage });
            const newImage: UploadedImage = Object.assign({}, image, { sizes: newSizes });

            return this.database.saveFile(newImage);
          })
          .then((newImage: UploadedImage) =>
            // TODO: This stores the file, then reads it from where it was stored, instead of reading from memory. It should return quickly.
            this.fileService.getFile(newImage.sizes[size].storageId)
              .then((data: NodeJS.ReadableStream) => [newImage, data])
          );
      });
  }
}
