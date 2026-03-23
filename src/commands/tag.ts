import { Command } from 'commander';
import chalk from 'chalk';
import { storage } from '../core/storage.js';

export const tagCommand = new Command('tag')
  .description('Add or remove tags on a version')
  .argument('<versionId>', 'Version ID')
  .argument('<tags...>', 'Tags to toggle')
  .action(async (versionId, tags) => {
    const version = await storage.getVersion(versionId);
    if (!version) {
      console.log(chalk.red('Version not found'));
      return;
    }

    const currentTags = new Set(version.tags);
    for (const tag of tags) {
      if (currentTags.has(tag)) {
        currentTags.delete(tag);
        console.log(chalk.dim(`  Removed: ${tag}`));
      } else {
        currentTags.add(tag);
        console.log(chalk.dim(`  Added: ${tag}`));
      }
    }

    await storage.updateVersion(versionId, { tags: [...currentTags] });
    console.log(chalk.green('✓') + ' Tags updated');
  });
