import { Command } from 'commander';
import chalk from 'chalk';
import { storage } from '../core/storage.js';
import { ensureInit } from '../core/ensure-init.js';

export const groupCommand = new Command('group')
  .description('Create a new version group')
  .argument('<name>', 'Group name (e.g. "Landing Page v1")')
  .option('-p, --prototype <id>', 'Prototype ID (uses first if omitted)')
  .option('-d, --desc <description>', 'Group description')
  .action(async (name, opts) => {
    const { prototypeId: defaultProtoId } = await ensureInit();
    const prototypeId = opts.prototype || defaultProtoId;

    const group = await storage.createGroup(prototypeId, {
      name,
      description: opts.desc,
    });

    console.log(chalk.green('\u2713') + ` Group "${name}" created`);
    console.log(chalk.dim(`  ID: ${group.id}`));
  });
