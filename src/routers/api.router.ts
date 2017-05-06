import { Service } from '../util/inject';
import { Use, UseType } from 'express-router-decorators';
import { ImageRouter } from './image.router';

@Service()
export class ApiRouter {

  @Use('/', UseType.ROUTER)
  public imageRouter: ImageRouter;

  constructor(
    imageRouter: ImageRouter
  ) {
    this.imageRouter = imageRouter;
  }
}
