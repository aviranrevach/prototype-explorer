import { Command } from 'commander';
import chalk from 'chalk';
import { storage } from '../core/storage.js';
import { ensureInit } from '../core/ensure-init.js';

export const listCommand = new Command('list')
  .description('List prototypes, groups, and versions')
  .option('-v, --versions', 'Show versions for each group')
  .action(async (opts) => {
    await ensureInit();

    const prototypes = await storage.listPrototypes();
    if (prototypes.length === 0) {
      console.log(chalk.dim('No prototypes yet.'));
      return;
    }

    for (const proto of prototypes) {
      const groups = await storage.listGroups(proto.id);
      const allVersions = await storage.listVersions(proto.id);
      console.log(
        `${chalk.bold(proto.name)} ${chalk.dim(`(${allVersions.length} versions, ${groups.length} groups)`)} ${chalk.dim(proto.id)}`,
      );

      for (const group of groups) {
        const gVersions = allVersions.filter((v) => v.groupId === group.id);
        console.log(
          `  ${chalk.cyan(group.name)} ${chalk.dim(`(${gVersions.length})`)} ${chalk.dim(group.id)}`,
        );

        if (opts.versions) {
          const byCategory = new Map<string, typeof gVersions>();
          for (const v of gVersions) {
            const cat = v.category || 'Uncategorized';
            if (!byCategory.has(cat)) byCategory.set(cat, []);
            byCategory.get(cat)!.push(v);
          }

          for (const [cat, versions] of byCategory) {
            console.log(`    ${chalk.dim(cat + ':')} `);
            for (const v of versions) {
              const star = v.starred ? chalk.yellow('★') : ' ';
              const tags = v.tags.length > 0 ? chalk.dim(` [${v.tags.join(', ')}]`) : '';
              console.log(`      ${star} ${v.name}${tags} ${chalk.dim(v.id)}`);
            }
          }
        }
      }

      const ungrouped = allVersions.filter((v) => !v.groupId);
      if (ungrouped.length > 0) {
        console.log(`  ${chalk.yellow('Ungrouped')} ${chalk.dim(`(${ungrouped.length})`)}`);
        if (opts.versions) {
          for (const v of ungrouped) {
            const star = v.starred ? chalk.yellow('★') : ' ';
            console.log(`    ${star} ${v.name} ${chalk.dim(v.id)}`);
          }
        }
      }
    }
  });
