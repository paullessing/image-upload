import { DATABASE_STRATEGY, DatabaseStrategy } from './database-strategy.interface';
import { Provider } from '../util/inject';
import { Config } from '../config/config.interface';
import { MemoryDatabaseStrategy } from './strategies/memory-database-strategy';
import { FilesystemDatabaseStrategy } from './strategies/filesystem-database-strategy';

@Provider(DATABASE_STRATEGY)
export class StorageStrategyProvider {
  constructor(
    private config: Config
  ) {}

  public $provide(): DatabaseStrategy {
    switch(this.config.databaseType) {
      case 'memory':
        return new MemoryDatabaseStrategy();
      case 'file':
        return new FilesystemDatabaseStrategy(this.config.fileDatabase);
      default:
        throw new Error(`Unknown Database type: '${this.config.databaseType}'`);
    }
  }
}
