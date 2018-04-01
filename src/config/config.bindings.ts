import { Bindings } from '../util/inject';
import { interfaces } from 'inversify';
import { config } from './config';
import { Config, CONFIG } from './config.interface';
import * as fs from 'fs';

@Bindings()
export class ConfigBindings {
  public static $bind(bind: interfaces.Bind): void {
    const configFile = readFile(process.env.CONFIG_FILE);

    if (configFile) {
      bind(CONFIG).toConstantValue(configFile);
      return;
    }

    const fallbackFile = readFile('/var/config.json');
    if (fallbackFile) {
      bind(CONFIG).toConstantValue(fallbackFile);
      return;
    }

    console.info('No config file found, falling back to defaults');
    bind(CONFIG).toConstantValue(config);
  }
}

function readFile(location: string): Config | null {
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
