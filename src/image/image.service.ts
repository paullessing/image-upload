import { Service } from '../util/inject';
import { inject } from 'inversify';
import { CONFIG, Config, ImageSizeConfig } from '../config/config.interface';
import * as sharp from 'sharp';
import { Duplex } from 'stream';

export interface ResizingStream {
  width: number;
  height: number;
  mimetype: string;
  stream: Duplex;
}

@Service()
export class ImageService {

  constructor(
    @inject(CONFIG) private config: Config
  ) {}

  public resize(imageData: NodeJS.ReadableStream, size: string): Promise<ResizingStream> {
    return Promise.reject('Not implemented');
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
