import { Service } from '../util/inject';
import { IMAGE_SIZES, ImageSize, ImageSizes } from '../interfaces/image-sizes';
import * as sharp from 'sharp';

@Service()
export class ImageService {

  public resize(imageData: NodeJS.ReadableStream, size: ImageSize): Promise<NodeJS.ReadableStream> {
    if (size === ImageSizes.ORIGINAL) {
      return Promise.resolve(imageData);
    }
    const image = sharp(imageData); // TODO this needs to be a buffer not a stream
    return Promise.resolve()
      .then(() => image.metadata())
      .then((metadata: sharp.Metadata) => {
        const isPortrait = metadata.width > metadata.height;
        const dimensions = getDimensions(size, isPortrait);

        return image.resize(...dimensions)
          .min() // Make image cover the dimensions
          .toBuffer(); // TODO this needs to be a stream not a buffer
      });
  }
}

function getDimensions(size: ImageSize, isPortrait: boolean): [number, number] {
  const configDimensions = IMAGE_SIZES[size];
  if (isPortrait && configDimensions[0] > configDimensions[1]) {
    return [configDimensions[1], configDimensions[0]];
  } else {
    return configDimensions.slice();
  }
}
