import { ImageMetadata, StorageId, UploadedFile } from './uploaded-file.model';

export interface UploadedImage extends UploadedFile, ImageMetadata {
  sizes: {
    [size: string]: ResizedImage
  }
}

export interface ResizedImage extends ImageMetadata {
  imageSize: string;
  size: number;
  storageId: StorageId;
}
