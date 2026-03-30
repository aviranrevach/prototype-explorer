import { Command } from 'commander';
import chalk from 'chalk';
import { storage } from '../core/storage.js';
import { ensureInit } from '../core/ensure-init.js';

export const chapterCommand = new Command('chapter')
  .description('Create a new chapter (a round of exploration)')
  .argument('<name>', 'Chapter name (e.g. "Dashboard v1", "Dark Theme")')
  .option('-p, --prototype <id>', 'Prototype ID (uses first if omitted)')
  .option('-d, --desc <description>', 'Chapter description')
  .action(async (name, opts) => {
    const { prototypeId: defaultProtoId } = await ensureInit();
    const prototypeId = opts.prototype || defaultProtoId;

    const group = await storage.createGroup(prototypeId, {
      name,
      description: opts.desc,
    });

    console.log(chalk.green('\u2713') + ` Chapter "${name}" created`);
    console.log(chalk.dim(`  ID: ${group.id}`));
  });

// Keep "group" as hidden alias for backwards compat
export const groupCommand = new Command('group')
  .description('Alias for chapter')
  .argument('<name>')
  .option('-p, --prototype <id>')
  .option('-d, --desc <description>')
  .action(async (name: string, opts: any) => {
    const { prototypeId: defaultProtoId } = await ensureInit();
    const prototypeId = opts.prototype || defaultProtoId;
    const group = await storage.createGroup(prototypeId, { name, description: opts.desc });
    console.log(chalk.green('\u2713') + ` Chapter "${name}" created`);
    console.log(chalk.dim(`  ID: ${group.id}`));
  });
