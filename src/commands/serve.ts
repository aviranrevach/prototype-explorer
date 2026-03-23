import { Command } from 'commander';
import chalk from 'chalk';
import open from 'open';
import { createServer } from '../server/index.js';
import { storage } from '../core/storage.js';

export const serveCommand = new Command('serve')
  .description('Start the Prototype Explorer')
  .option('-p, --port <port>', 'Port number', '4200')
  .option('--no-open', 'Do not open browser automatically')
  .action(async (opts) => {
    const config = await storage.getConfig();
    if (!config) {
      console.log(chalk.yellow('Not initialized. Run `proto-explorer init` first.'));
      return;
    }

    const port = parseInt(opts.port, 10);
    const app = await createServer();

    app.listen(port, () => {
      const url = `http://localhost:${port}`;
      console.log(chalk.green('✓') + ` Explorer running at ${chalk.cyan(url)}`);
      if (opts.open !== false) {
        open(url);
      }
    });
  });
