import { Transform } from 'stream';

export class SizeDetectingStream extends Transform {
  private _size: number = 0;

  public get size(): number {
    return this._size;
  }

  public _transform(chunk: Buffer, encoding: string, callback: () => void) {
    this._size += chunk.toString().length;
    this.push(chunk);
    callback();
  }
}
