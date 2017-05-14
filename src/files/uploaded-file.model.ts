import { Stream } from 'stream';
import { Moment } from 'moment';

export type FileContent = string | Stream;
export type FileId = string;
export type StorageId = string;

export interface FileVersion {
  key: string;
  size: number;
  storageId: StorageId;
  mimetype: string;
}

export interface UploadedFile {
  // Identifiers
  id?: FileId; // TODO reason more strictly about IDs

  dateUploaded: Moment;
  filename: string;
  versions: {
    [key: string]: FileVersion
  };
}
