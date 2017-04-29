import { Stream  } from 'stream';
import { Moment } from 'moment';

export type FileContent = string | Stream;
export type FileId = string;

export interface UploadedFile {
  id: FileId;
  content: FileContent;
  dateUploaded: Moment;
  size: number;
  mimeType: string;
}
