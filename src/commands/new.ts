import { Command } from 'commander';
import chalk from 'chalk';
import { storage } from '../core/storage.js';
import { ensureInit } from '../core/ensure-init.js';

export const newCommand = new Command('new')
  .description('Create a new prototype')
  .argument('<name>', 'Prototype name')
  .option('-d, --desc <description>', 'Description')
  .action(async (name, opts) => {
    await ensureInit();

    const proto = await storage.createPrototype({ name, description: opts.desc || '' });
    console.log(chalk.green('\u2713') + ` Prototype "${name}" created`);
    console.log(chalk.dim(`  ID: ${proto.id}`));
  });
