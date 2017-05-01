import { DATABASE_STRATEGY, DatabaseStrategy } from './database-strategy.interface';
import { Provider } from '../util/inject';
import { Config, CONFIG } from '../config';
import { MemoryDatabaseStrategy } from './strategies/memory-database-strategy';
import { FilesystemDatabaseStrategy } from './strategies/filesystem-database-strategy';
import { inject } from 'inversify';

@Provider(DATABASE_STRATEGY)
export class DatabaseStrategyProvider {
  constructor(
    @inject(CONFIG) private config: Config
  ) {}

  public $provide(): DatabaseStrategy {
    switch(this.config.databaseType) {
      case 'memory':
        return new MemoryDatabaseStrategy();
      case 'file':
        if (this.config.fileDatabase) {
          return new FilesystemDatabaseStrategy(this.config.fileDatabase);
        } else {
          throw new Error(`Missing database configuration for file database`);
        }
      default:
        throw new Error(`Unknown Database type: '${this.config.databaseType}'`);
    }
  }
}
