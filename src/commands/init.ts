import { Command } from 'commander';
import chalk from 'chalk';
import { storage } from '../core/storage.js';

export const initCommand = new Command('init')
  .description('Initialize Prototype Explorer in the current project')
  .option('-n, --name <name>', 'Project name')
  .action(async (opts) => {
    const existing = await storage.getConfig();
    if (existing) {
      console.log(chalk.yellow('Already initialized. Config found at .proto-explorer/config.json'));
      return;
    }

    const projectName = opts.name || process.cwd().split('/').pop() || 'my-project';
    await storage.init(projectName);
    console.log(chalk.green('✓') + ' Prototype Explorer initialized');
    console.log(chalk.dim(`  Run ${chalk.cyan('proto-explorer serve')} to open the explorer`));
  });
