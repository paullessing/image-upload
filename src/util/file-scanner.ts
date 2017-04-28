import * as fs from 'fs';
import * as path from 'path';

/**
 * Scans all files in the given directory, and uses `require()` to include them.
 * This will trigger processing of decorator functions even on files that are not in scope of app.ts.
 */
export class FileScanner {
  constructor(
    private directoryName: string
  ) {}

  public scan(): void {
    this.scanRecursively(this.directoryName);
  }

  private scanRecursively(dirName: string): void {
    fs.readdirSync(dirName)
      .forEach((filename: string) => {
        if (filename === __filename) { // Skip this file
          return;
        }
        const fullPath = path.join(dirName, filename);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          this.scanRecursively(fullPath);
        } else if (
          filename.match(/\.js$/i) &&
          !filename.match(/\.spec.js$/i)
        ) {
          // Black magic!
          require('./' + path.relative(__dirname, fullPath)); // tslint:disable-line:no-require-imports
        }
      });
  }
}
