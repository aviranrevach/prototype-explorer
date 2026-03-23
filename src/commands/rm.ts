import { Command } from 'commander';
import chalk from 'chalk';
import { storage } from '../core/storage.js';

export const rmCommand = new Command('rm')
  .description('Delete a version')
  .argument('<versionId>', 'Version ID to delete')
  .option('-f, --force', 'Skip confirmation')
  .action(async (versionId, opts) => {
    const version = await storage.getVersion(versionId);
    if (!version) {
      console.log(chalk.red('Version not found'));
      return;
    }

    if (!opts.force) {
      console.log(chalk.yellow(`Deleting "${version.name}" (${versionId}). Use --force to skip this warning.`));
    }

    await storage.deleteVersion(version.prototypeId, versionId);
    console.log(chalk.green('✓') + ` Version "${version.name}" deleted`);
  });
