import { Stream  } from 'stream';
import { Moment } from 'moment';
import { ImageSize } from '../interfaces/image-sizes';

export type FileContent = string | Stream;
export type FileId = string;
export type StorageId = string;

export interface FileVersion {
  key: string;
  size: number;
  storageId: StorageId;
}

export interface UploadedFile {
  // Identifiers
  id?: FileId;

  dateUploaded: Moment;
  mimetype: string;
  filename: string;
  versions: {
    [key: string]: FileVersion
  };
}
