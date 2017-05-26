import { Transform } from 'stream';

export class BufferingStream extends Transform {
  private data: Buffer[] = [];
  public length: number = 0;

  public get buffer(): Buffer {
    return Buffer.concat(this.data);
  }

  public _transform(chunk: Buffer, encoding: string, callback: () => void) {
    this.data.push(chunk);
    this.length += chunk.length;
    this.push(chunk);
    callback();
  }
}
