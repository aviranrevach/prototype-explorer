import { Command } from 'commander';
import chalk from 'chalk';
import { storage } from '../core/storage.js';
import { createSnapshot } from '../core/snapshot.js';
import { ensureInit } from '../core/ensure-init.js';

export async function runSnap(name: string, opts: {
  prototype?: string;
  group?: string;
  category?: string;
  tag?: string[];
  desc?: string;
}) {
  const { prototypeId: defaultProtoId, groupId: defaultGroupId } = await ensureInit();

  const prototypeId = opts.prototype || defaultProtoId;

  let groupId = opts.group;
  if (!groupId) {
    const groups = await storage.listGroups(prototypeId);
    groupId = groups.length > 0 ? groups[0].id : defaultGroupId;
  }

  const config = (await storage.getConfig())!;
  const version = await createSnapshot(prototypeId, {
    name,
    groupId,
    category: opts.category || 'Scenarios',
    description: opts.desc,
    tags: opts.tag || [],
    author: config.defaultAuthor,
  });

  console.log(chalk.green('\u2713') + ` Snapshot "${name}" created (${version.fileCount} files)`);
  if (opts.category) {
    console.log(chalk.dim(`  Category: ${opts.category}`));
  }
  if (opts.tag?.length) {
    console.log(chalk.dim(`  Tags: ${opts.tag.join(', ')}`));
  }
}

export const snapCommand = new Command('snap')
  .description('Create a new version snapshot')
  .argument('<name>', 'Version name')
  .option('-p, --prototype <id>', 'Prototype ID (uses first if omitted)')
  .option('-g, --group <id>', 'Chapter ID (uses most recent if omitted)')
  .option('-c, --category <name>', 'Category label (default: "Scenarios")')
  .option('-t, --tag <tags...>', 'Tags to apply')
  .option('-d, --desc <description>', 'Version description')
  .action(async (name, opts) => {
    await runSnap(name, opts);
  });
