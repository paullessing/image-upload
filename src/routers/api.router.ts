import { Service } from '../util/inject';
import { Get, Post, Response } from 'express-router-decorators';
import * as express from 'express';
import * as Busboy from 'busboy';
import { FileService } from '../files/file.service';
import { UploadedFile } from '../files/uploaded-file.model';
import { ImageSizes } from '../interfaces/image-sizes';

@Service()
export class ApiRouter {

  constructor(
    private fileService: FileService
  ) {}

  @Get('/')
  public getRoot(): Promise<Response> {
    return Response.resolve('Hello API!');
  }

  @Get('/image')
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

  @Post('/image')
  public uploadImage(req: express.Request, res: express.Response): Promise<UploadedFile> {
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
          uploadedFile = this.fileService.uploadFile(file)
            .then((file: UploadedFile) => {
              return file;
            });
        } else {
          // Skip
          file.resume();
        }
      });
      busboy.on('finish', function() {
        if (uploadedFile) {
          uploadedFile.then((file: UploadedFile) => Response.success(201, file))
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

  @Get('/image/:imageId/:size')
  public getOriginalImage(req: express.Request, res: express.Response): void {
    const imageId = req.params['imageId'];
    const size = req.params['size'];
    console.log('image id', imageId, size);

    if (ImageSizes.values().indexOf(size) < 0) {
      return res.sendStatus(404).end();
    }

    this.fileService.getFile(imageId, size)
      .then((data: NodeJS.ReadableStream) => {
        data.pipe(res);
      }, () => {
        res.sendStatus(404).end();
      }).catch((e) => {
        console.error(e);
        res.sendStatus(500).end();
    });
  }
}
