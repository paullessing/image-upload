import { Bindings } from '../util/inject';
import { interfaces } from 'inversify';
import { config } from './config';
import { CONFIG } from './config.interface';

@Bindings()
export class ConfigBindings {
  public static $bind(bind: interfaces.Bind): void {
    bind(CONFIG).toConstantValue(config); // TODO read from config file
  }
}
