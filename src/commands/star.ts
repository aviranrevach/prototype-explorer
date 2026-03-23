import { Command } from 'commander';
import chalk from 'chalk';
import { storage } from '../core/storage.js';

export const starCommand = new Command('star')
  .description('Toggle star on a version')
  .argument('<versionId>', 'Version ID')
  .action(async (versionId) => {
    const version = await storage.getVersion(versionId);
    if (!version) {
      console.log(chalk.red('Version not found'));
      return;
    }

    await storage.updateVersion(versionId, { starred: !version.starred });
    console.log(
      version.starred
        ? chalk.dim('★ Unstarred')
        : chalk.yellow('★ Starred'),
    );
  });
