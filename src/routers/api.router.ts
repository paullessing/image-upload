import { Service } from '../util/inject';
import { Get, Response } from 'express-router-decorators';

@Service()
export class ApiRouter {

  @Get('/')
  public getRoot(): Promise<Response> {
    return Response.resolve('Hello API!');
  }
}
