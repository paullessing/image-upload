import { Provider } from '../util/inject';
import { Config } from '../config';
import { STORAGE_STRATEGY, StorageStrategy } from './storage-strategy.interface';
import { StoreToDiskStrategy } from './disk.strategy';
import { CONFIG } from '../config';
import { inject } from 'inversify';
import { UploadToAwsStrategy } from './aws.strategy';

@Provider(STORAGE_STRATEGY)
export class StorageStrategyProvider {
  constructor(
    @inject(CONFIG) private config: Config
  ) {}

  public $provide(): StorageStrategy {
    switch(this.config.storage.type) {
      case 'disk':
        return new StoreToDiskStrategy(this.config.storage);
      case 'aws':
        return new UploadToAwsStrategy(this.config.storage);
      default:
        throw new Error(`Unknown Storage type: '${(this.config.storage as any).type}'`);
    }
  }
}
