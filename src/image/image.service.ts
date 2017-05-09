import { Service } from '../util/inject';
import { ImageSize } from '../interfaces/image-sizes';

@Service()
export class ImageService {

  public resize(image: NodeJS.ReadableStream, size: ImageSize): Promise<NodeJS.ReadableStream> {
    return Promise.resolve(image); // TODO use a library
  }

}
