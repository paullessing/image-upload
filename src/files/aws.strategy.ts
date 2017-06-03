import * as uuid from 'uuid';
import * as fs from 'fs';
import { AWSError, S3 } from 'aws-sdk';
import * as s3Stream from 's3-upload-stream';

import { StorageId } from '../interfaces/uploaded-file.model';
import { StorageStrategy } from './storage-strategy.interface';
import * as path from 'path';

export class UploadToAwsStrategy implements StorageStrategy {

  private s3: S3;
  private uploader: s3Stream.S3StreamUploader;

  constructor() {
    // TODO inject config
    const configFile = path.join(__dirname, '../../aws.json');
    const settings = JSON.parse(fs.readFileSync(configFile).toString());
    this.s3 = new S3(settings);

    this.uploader = s3Stream(this.s3);
  }

  public async storeStream(content: NodeJS.ReadableStream): Promise<StorageId> {
    const id = await this.getUniqueId();

    return new Promise<StorageId>((resolve, reject) => {
      try {
        console.log('UPloading to ' ,id);

        const upload = this.uploader.upload({
          Bucket: 'image-upload-data',
          Key: id
        });

        content.on('end', () => {
          resolve(id);
        });
        content.on('error', (err: any) => {
          reject(err);
        });

        content.pipe(upload);
      } catch (e) {
        reject(e);
      }
    });
  }

  public async storeBuffer(data: Buffer): Promise<StorageId> {
    const id = await this.getUniqueId();

    await this.s3.putObject({
      Bucket: 'image-upload-data',
      Key: id,
      Body: data
    });
    return id;
  }

  public async getStream(id: StorageId): Promise<NodeJS.ReadableStream> {
    return this.s3.getObject({
      Bucket: 'image-upload-data',
      Key: id
    }).createReadStream();
  }

  private getUniqueId(maxRetries: number = 3): Promise<string> {
    if (maxRetries <= 0) {
      return Promise.reject('Could not generate unique ID');
    }
    const id = uuid();
    return Promise.resolve()
      .then(() =>
        this.s3.headObject({
          Bucket: 'image-upload-data',
          Key: id
        }).promise()
      )
      .then(() => {
        // Success means the ID is taken
        console.log('Failed to get ID, file exists');
        return this.getUniqueId(maxRetries - 1)
      }, (err: AWSError) => {
        if (err.code === 'NotFound') {
          return id; // Success!
        }
        console.log('Failed to get ID, error:', err.code);
        return this.getUniqueId(maxRetries - 1);
      });
  }
}
