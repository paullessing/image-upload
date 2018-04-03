import { Service } from '../util/inject';
import { Get, Post, Response } from 'express-router-decorators';
import * as express from 'express';
import * as Busboy from 'busboy';
import { UploadedFile } from '../interfaces/uploaded-file.model';
import { DownloadableFile, FileNotFoundError, UploadService } from '../upload/upload.service';
import { CONFIG, Config, ImageSizeConfig } from '../config/config.interface';
import { inject } from 'inversify';
import { UploadedImage } from '../interfaces/uploaded-image.model';

export interface ImageMetadata {
  id: string;
  filename: string;
  dateUploaded: string;
  sizes: string[];
}

class UnknownImageSizeError extends Error {
  constructor(size: string) {
    super(`Size '${size}' does not exist in config`); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

@Service()
export class ImageRouter {

  private knownImageSizes: string[];

  constructor(
    private uploadService: UploadService,
    @inject(CONFIG) config: Config
  ) {
    this.knownImageSizes = config.imageSizes.map((size: ImageSizeConfig) => size.name);
  }

  @Get('/')
  public getImageUploadForm(): Promise<Response> {
    // TEMPORARY CODE
    return Response.resolve(`
<html><head></head><body>
  <form method="POST" enctype="multipart/form-data">
    <input type="file" name="image"><br />
    <input type="submit">
  </form>
</body></html>`);
  }

  @Post('/')
  public uploadImage(req: express.Request, res: express.Response): Promise<Response> {
    const busboy = new Busboy({
      headers: req.headers,
      limits: {
        fileSize: 1000000
      }
    });

    let uploadedFile: Promise<UploadedImage>;

    return new Promise((resolve, reject) => {
      busboy.on('file', (
        fieldname: string,
        file: NodeJS.ReadableStream,
        filename: string,
        encoding: string,
        mimetype: string
      ) => {
        if (fieldname === 'image') {
          uploadedFile = this.uploadService.uploadImage(file, filename)
            .then((file: UploadedImage) => {
              return file;
            });
        } else {
          // Skip
          file.resume();
        }
      });
      busboy.on('finish', () => {
        if (uploadedFile) {
          uploadedFile.then((image: UploadedImage) => Response.success(201, this.getMetadata(image)))
            .then(resolve, reject);
        } else {
          reject(Response.error(400, 'Missing "image" field in request'));
        }
      });
      busboy.on('error', (err: any) => {
        console.error(err);
        reject(Response.error(500));
      });

      req.pipe(busboy);
    });
  }

  @Get('/:imageId')
  @Get('/:imageId/:size')
  public getImage(req: express.Request, res: express.Response): void {
    const imageId = req.params['imageId'];
    Promise.resolve()
      .then(() => {
        return this.getValidImageSize(req.params['size']);
      })
      .then((size: string | null) => {
        return this.uploadService.getImageContents(imageId, size)
          .then((image: DownloadableFile) => {
            res.header('Content-Length', `${image.size}`);
            res.header('Content-Type', `${image.mimetype}`);

            if (image.data instanceof Buffer) {
              res.end(image.data);
            } else {
              (image.data as NodeJS.ReadableStream).pipe(res);
            }
          });
      }).catch((e: any) => {
        if (e instanceof FileNotFoundError) {
          res.sendStatus(404).end();
        } else if (e instanceof UnknownImageSizeError) {
          console.error(e);
          res.sendStatus(404).end();
        } else {
          console.error(e);
          res.sendStatus(500).end();
        }
      })
  }

  @Get('/:imageId/info') // Must be below getImage for correct evaluation (This is incorrect, see https://github.com/FOODit/express-router-decorators/issues/2)
  public getImageInfo(req: express.Request): Promise<Response> {
    const imageId = req.params['imageId'];
    return this.uploadService.getFile<UploadedImage>(imageId)
      .then((image: UploadedImage) => Response.success(this.getMetadata(image)))
      .catch((e: any) => {
        if (e instanceof FileNotFoundError) {
          return Response.reject(404);
        } else {
          console.error(e);
          return Response.reject(500);
        }
      });
  }

  private getMetadata(image: UploadedImage): ImageMetadata {
    return {
      id: image.id as string,
      filename: image.filename,
      dateUploaded: image.dateUploaded.toJSON(),
      sizes: Object.keys(image.sizes)
    };
  }

  private getValidImageSize(size: string): string | null {
    if (!size || size === 'original') {
      return null;
    }

    if (this.knownImageSizes.indexOf(size) < 0) {
      throw new UnknownImageSizeError(size);
    }

    return size;
  }
}
