import { DATABASE_STRATEGY, DatabaseStrategy } from './database-strategy.interface';
import { Provider } from '../util/inject';
import { Config, CONFIG } from '../config';
import { MemoryDatabaseStrategy } from './strategies/memory-database-strategy';
import { FilesystemDatabaseStrategy } from './strategies/filesystem-database-strategy';
import { inject } from 'inversify';
import { MongodbDatabaseStrategy } from './strategies/mongodb-database-strategy';

@Provider(DATABASE_STRATEGY)
export class DatabaseStrategyProvider {
  constructor(
    @inject(CONFIG) private config: Config
  ) {}

  public $provide(): DatabaseStrategy {
    switch(this.config.database.type) {
      case 'memory':
        return new MemoryDatabaseStrategy();
      case 'file':
        return new FilesystemDatabaseStrategy(this.config.database);
      case 'mongodb':
        const strategy = new MongodbDatabaseStrategy(this.config.database);
        strategy.init();
        return strategy;
      default:
        throw new Error(`Unknown Database type: '${(this.config.database as any).type}'`);
    }
  }
}
