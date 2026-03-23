import { Command } from 'commander';
import chalk from 'chalk';
import { restoreVersion } from '../core/snapshot.js';

export const restoreCommand = new Command('restore')
  .description('Restore project files to a specific version')
  .argument('<versionId>', 'Version ID to restore')
  .action(async (versionId) => {
    try {
      await restoreVersion(versionId);
      console.log(chalk.green('✓') + ' Files restored');
    } catch (err: any) {
      console.log(chalk.red('✗') + ` ${err.message}`);
    }
  });
