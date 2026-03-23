import { Command } from 'commander';
import chalk from 'chalk';
import { storage } from '../core/storage.js';

export const groupCommand = new Command('group')
  .description('Create a new version group')
  .argument('<name>', 'Group name (e.g. "Landing Page v1")')
  .option('-p, --prototype <id>', 'Prototype ID (uses first if omitted)')
  .option('-d, --desc <description>', 'Group description')
  .action(async (name, opts) => {
    const config = await storage.getConfig();
    if (!config) {
      console.log(chalk.yellow('Not initialized. Run `proto-explorer init` first.'));
      return;
    }

    let prototypeId = opts.prototype;
    if (!prototypeId) {
      const protos = await storage.listPrototypes();
      if (protos.length === 0) {
        console.log(chalk.yellow('No prototypes found. Run `proto-explorer new "Name"` first.'));
        return;
      }
      prototypeId = protos[0].id;
    }

    const group = await storage.createGroup(prototypeId, {
      name,
      description: opts.desc,
    });

    console.log(chalk.green('✓') + ` Group "${name}" created`);
    console.log(chalk.dim(`  ID: ${group.id}`));
  });
