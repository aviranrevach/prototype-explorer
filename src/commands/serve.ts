import { Command } from 'commander';
import chalk from 'chalk';
import open from 'open';
import { createServer } from '../server/index.js';
import { ensureInit } from '../core/ensure-init.js';

export const serveCommand = new Command('serve')
  .description('Start the Snap explorer')
  .option('-p, --port <port>', 'Port number', '4200')
  .option('--no-open', 'Do not open browser automatically')
  .action(async (opts) => {
    await ensureInit();

    const port = parseInt(opts.port, 10);
    const app = await createServer();

    app.listen(port, () => {
      const url = `http://localhost:${port}`;
      console.log(chalk.green('\u2713') + ` Explorer running at ${chalk.cyan(url)}`);
      if (opts.open !== false) {
        open(url);
      }
    });
  });
