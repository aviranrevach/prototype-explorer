import { Command } from 'commander';
import chalk from 'chalk';
import { ensureInit } from '../core/ensure-init.js';
import { buildProjectTree, printProjectTree } from '../core/project-tree.js';

export const actionCommand = new Command('action')
  .description('Show project overview and available actions')
  .action(async () => {
    const { prototypeId } = await ensureInit();
    const tree = await buildProjectTree(prototypeId);
    const w = chalk.white;

    console.log('');
    printProjectTree(tree);

    console.log(`\nAsk me anything about this project.\n`);
    console.log(`What would you like to do next?`);
    console.log(` 1. ${w('SNAP')} current index.html (new round or take)`);
    console.log(` 2. ${w('START')} a new chapter`);
    console.log(` 3. ${w('SWITCH')} to a different snap to build from`);
    console.log(` 4. ${w('OPEN')} visual explorer`);
    console.log(` 5. ${w('MORE')} things you can do`);
    console.log('');
  });
