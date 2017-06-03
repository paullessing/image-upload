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
    switch(this.config.storageType) {
      case 'disk':
        if (!this.config.diskStorage) {
          throw new Error('Missing config for storage type: disk');
        }
        return new StoreToDiskStrategy(this.config.diskStorage);
      case 'aws':
        return new UploadToAwsStrategy();
      default:
        throw new Error(`Unknown Storage type: '${this.config.storageType}'`);
    }
  }
}
