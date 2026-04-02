import path from 'node:path';
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
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

  // Validate source file exists
  const config = await storage.getConfig();
  const sourceFile = config?.sourceFile || 'index.html';
  const sourcePath = path.resolve(process.cwd(), sourceFile);

  if (!(await fs.pathExists(sourcePath))) {
    console.log(chalk.red(`No ${sourceFile} found in project root.`));
    console.log(chalk.dim(`Create one first, or run ${chalk.cyan('snapp init')} to generate a starter template.`));
    process.exit(1);
  }

  const prototypeId = opts.prototype || defaultProtoId;

  let groupId = opts.group;
  if (!groupId) {
    const groups = await storage.listGroups(prototypeId);
    groupId = groups.length > 0 ? groups[0].id : defaultGroupId;
  }

  const version = await createSnapshot(prototypeId, {
    name,
    groupId,
    category: opts.category || 'Scenarios',
    description: opts.desc,
    tags: opts.tag || [],
    author: config?.defaultAuthor,
  });

  console.log(chalk.green('\u2713') + ` Snapshot "${name}" saved`);
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
