import { Bindings } from '../util/inject';
import { interfaces } from 'inversify';
import { defaultConfig } from './default.config';
import { Config, CONFIG } from './config.interface';
import * as fs from 'fs';

@Bindings()
export class ConfigBindings {
  public static $bind(bind: interfaces.Bind): void {
    const configFile = process.env.CONFIG_FILE;
    if (configFile) {
      const fileConfig = readFile(process.env.CONFIG_FILE);

      if (fileConfig) {
        bind(CONFIG).toConstantValue(fileConfig);
        return;
      } else {
        throw new Error(`Config file ${configFile} not found or empty`);
      }
    } else {
      console.info('No config file found, falling back to defaults');
      bind(CONFIG).toConstantValue(defaultConfig);
    }
  }
}

function readFile(location: string | undefined): Config | null {
  if (!location) {
    return null;
  }
  if (!fs.existsSync(location) || !fs.statSync(location).isFile()) {
    return null;
  }
  const raw = fs.readFileSync(location).toString();
  if (!raw.trim().length) {
    return null;
  }
  return JSON.parse(raw);
}
