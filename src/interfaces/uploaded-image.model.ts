import { FileId } from './uploaded-file.model';
import { Moment } from 'moment';

export interface UploadedImage {
  id: FileId;


  dateUploaded: Moment;
  filename: string;

}
