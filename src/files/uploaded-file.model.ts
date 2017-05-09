import { Stream  } from 'stream';
import { Moment } from 'moment';
import { ImageSize } from '../interfaces/image-sizes';

export type FileContent = string | Stream;
export type FileId = string;
export type StorageId = string;

export interface UploadedFile {
  // Identifiers
  id?: FileId;
  storageId?: StorageId;

  dateUploaded: Moment;
  size: number;
  mimetype: string;
  filename: string;
  sizes: ImageSize[];
}
