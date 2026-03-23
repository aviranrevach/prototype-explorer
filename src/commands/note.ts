import { Command } from 'commander';
import chalk from 'chalk';
import { storage } from '../core/storage.js';

export const noteCommand = new Command('note')
  .description('Set notes on a version')
  .argument('<versionId>', 'Version ID')
  .argument('<text>', 'Note text')
  .action(async (versionId, text) => {
    const version = await storage.getVersion(versionId);
    if (!version) {
      console.log(chalk.red('Version not found'));
      return;
    }

    await storage.updateVersion(versionId, { notes: text });
    console.log(chalk.green('✓') + ' Note saved');
  });
