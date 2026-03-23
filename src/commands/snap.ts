import { Command } from 'commander';
import chalk from 'chalk';
import { storage } from '../core/storage.js';
import { createSnapshot } from '../core/snapshot.js';

export const snapCommand = new Command('snap')
  .description('Create a new version snapshot')
  .argument('<name>', 'Version name')
  .option('-p, --prototype <id>', 'Prototype ID (uses first if omitted)')
  .option('-g, --group <id>', 'Group ID (uses most recent if omitted)')
  .option('-c, --category <name>', 'Category label (default: "Scenarios")')
  .option('-t, --tag <tags...>', 'Tags to apply')
  .option('-d, --desc <description>', 'Version description')
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

    let groupId = opts.group;
    if (!groupId) {
      const groups = await storage.listGroups(prototypeId);
      if (groups.length === 0) {
        const group = await storage.createGroup(prototypeId, { name: 'Default' });
        groupId = group.id;
        console.log(chalk.dim('  Created default group'));
      } else {
        groupId = groups[0].id;
      }
    }

    const version = await createSnapshot(prototypeId, {
      name,
      groupId,
      category: opts.category || 'Scenarios',
      description: opts.desc,
      tags: opts.tag || [],
      author: config.defaultAuthor,
    });

    console.log(chalk.green('✓') + ` Snapshot "${name}" created (${version.fileCount} files)`);
    if (opts.category) {
      console.log(chalk.dim(`  Category: ${opts.category}`));
    }
    if (opts.tag?.length) {
      console.log(chalk.dim(`  Tags: ${opts.tag.join(', ')}`));
    }
  });
