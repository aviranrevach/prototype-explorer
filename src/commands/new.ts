import { Command } from 'commander';
import chalk from 'chalk';
import { storage } from '../core/storage.js';

export const newCommand = new Command('new')
  .description('Create a new prototype')
  .argument('<name>', 'Prototype name')
  .option('-d, --desc <description>', 'Description')
  .action(async (name, opts) => {
    const config = await storage.getConfig();
    if (!config) {
      console.log(chalk.yellow('Not initialized. Run `proto-explorer init` first.'));
      return;
    }

    const proto = await storage.createPrototype({ name, description: opts.desc || '' });
    console.log(chalk.green('✓') + ` Prototype "${name}" created`);
    console.log(chalk.dim(`  ID: ${proto.id}`));
  });
