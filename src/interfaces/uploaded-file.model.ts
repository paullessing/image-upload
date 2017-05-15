import { Stream } from 'stream';
import { Moment } from 'moment';
import { FileType } from './file-type.enum';

export type FileContent = string | Stream;
export type FileId = string;
export type StorageId = string;

// export interface FileVersion {
//   key: string;
//   size: number;
//   storageId: StorageId;
//   mimetype: string;
// }

// export interface UploadedFile {
//   // Identifiers
//   id?: FileId; // TODO reason more strictly about IDs
//
//   dateUploaded: Moment;
//   filename: string;
//
//   // TODO move all this to the image model (files don't have versions) and add sizes to the image when reading
//   versions: {
//     [key: string]: FileVersion
//   };
// }

export interface UploadedFile {
  id: FileId | null;
  fileType: FileType;

  dateUploaded: Moment;
  size: number;
  filename: string;
  storageId: StorageId;
  mimetype: string;
}

export type ImageMetadata = {
  width: number;
  height: number;
  mimetype: string;
}

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
