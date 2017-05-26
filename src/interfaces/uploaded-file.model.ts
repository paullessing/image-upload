import { Stream } from 'stream';
import { Moment } from 'moment';
import { FileType } from './file-type.enum';

export type FileContent = string | Stream;
export type FileId = string;
export type StorageId = string;

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
