import { Transform } from 'stream';
import * as fileType from 'file-type';

export class FileTypeDetectingStream extends Transform {
  private _fileType: fileType.FileTypeResult;

  public get fileType(): fileType.FileTypeResult {
    return this._fileType;
  }

  public _transform(chunk: Buffer, encoding: string, callback: () => void) {
    if (!this._fileType) {
      this._fileType = fileType(chunk);
    }
    this.push(chunk);
    callback();
  }
}
