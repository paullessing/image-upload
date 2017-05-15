import { Service } from '../util/inject';
import { Get, Post, Response } from 'express-router-decorators';
import * as express from 'express';
import * as Busboy from 'busboy';
import { UploadedFile } from '../interfaces/uploaded-file.model';
import { ImageSize, ImageSizes } from '../interfaces/image-sizes';
import { DownloadableFile, FileNotFoundError, UploadService } from '../upload/upload.service';

export interface ImageMetadata {
  id: string;
  filename: string;
  dateUploaded: string;
  sizes: string[];
}

@Service()
export class ImageRouter {

  constructor(
    private uploadService: UploadService
  ) {}

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

    let uploadedFile: Promise<UploadedFile>;

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
            .then((file: UploadedFile) => {
              return file;
            });
        } else {
          // Skip
          file.resume();
        }
      });
      busboy.on('finish', () => {
        if (uploadedFile) {
          uploadedFile.then((file: UploadedFile) => Response.success(201, this.getMetadata(file)))
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
    const size = req.params['size'] || ImageSizes.ORIGINAL;

    if (ImageSizes.values().indexOf(size) < 0) {
      return res.sendStatus(404).end();
    }

    this.uploadService.getImageContents(imageId, size)
      .then((image: DownloadableFile) => {
        res.header('Content-Length', `${image.size}`);
        res.header('Content-Type', `${image.mimetype}`);
        image.data.pipe(res);
      }, () => {
        res.sendStatus(404).end();
      }).catch((e) => {
      console.error(e);
      res.sendStatus(500).end();
    });
  }

  @Get('/:imageId/info') // Must be below getImage for correct evaluation (This is incorrect, see https://github.com/FOODit/express-router-decorators/issues/2)
  public getImageInfo(req: express.Request): Promise<Response> {
    const imageId = req.params['imageId'];
    return this.uploadService.getFile(imageId)
      .then((file: UploadedFile) => Response.success(this.getMetadata(file)))
      .catch((e: any) => {
        if (e instanceof FileNotFoundError) {
          return Response.reject(404);
        } else {
          console.error(e);
          return Response.reject(500);
        }
      });
  }

  private getMetadata(image: UploadedFile): ImageMetadata {
    return {
      id: image.id as string,
      filename: image.filename,
      dateUploaded: image.dateUploaded.toJSON(),
      sizes: Object.keys(image.versions)
    };
  }
}
