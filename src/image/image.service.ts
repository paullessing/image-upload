import { Service } from '../util/inject';
import { inject } from 'inversify';
import { CONFIG, Config, ImageSizeConfig } from '../config/config.interface';
import * as sharp from 'sharp';
import { ImageMetadata } from '../interfaces/uploaded-file.model';
import * as mime from 'mime-types';

export interface ResizedImage {
  width: number;
  height: number;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Service()
export class ImageService {

  constructor(
    @inject(CONFIG) private config: Config
  ) {}

  public resize(imageData: NodeJS.ReadableStream, sourceMetadata: ImageMetadata, size: string): Promise<ResizedImage> {
    return new Promise((resolve, reject) => {
      const dimensions = this.getDimensions(size, sourceMetadata.width < sourceMetadata.height);
      const s = sharp()
        .resize(dimensions.width, dimensions.height)
        .min()
        .toBuffer((err, buffer, info) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              width: info.width,
              height: info.height,
              mimetype: mime.types[info.format],
              size: info.size,
              buffer
            });
          }
        });
      imageData.pipe(s);
    });

    // return Promise.reject('Not implemented');

    // const image = sharp(imageData); // TODO this needs to be a buffer not a stream
    // return Promise.resolve()
    //   .then(() => image.metadata())
    //   .then((metadata: sharp.Metadata) => {
    //     const isPortrait = metadata.width > metadata.height;
    //     const dimensions = getDimensions(size, isPortrait);
    //
    //     return image.resize(...dimensions)
    //       .min() // Make image cover the dimensions
    //       .toBuffer(); // TODO this needs to be a stream not a buffer
    //   });
  }

  private getDimensions(size: string, isPortrait: boolean): { width: number, height: number } {
    const config = this.config.imageSizes.find((value: ImageSizeConfig) => value.name === size);

    if (!config) {
      throw new Error(`Cannot find image size: '${size}'`);
    }

    if (isPortrait && config.width > config.height) {
      return { width: config.height, height: config.width };
    } else {
      return { width: config.width, height: config.height };
    }
  }
}
