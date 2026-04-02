import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { serveCommand } from './commands/serve.js';
import { snapCommand, runSnap } from './commands/snap.js';
import { listCommand } from './commands/list.js';
import { newCommand } from './commands/new.js';
import { chapterCommand, groupCommand } from './commands/group.js';
import { restoreCommand } from './commands/restore.js';
import { tagCommand } from './commands/tag.js';
import { starCommand } from './commands/star.js';
import { noteCommand } from './commands/note.js';
import { rmCommand } from './commands/rm.js';
import { contextCommand } from './commands/context.js';
import { briefCommand } from './commands/brief.js';
import { exportCommand } from './commands/export.js';
import { actionCommand } from './commands/action.js';

const program = new Command();

program
  .name('snapp')
  .description('Save, organize, and explore your coded prototypes')
  .version('0.1.0')
  .argument('[name]', 'Snapshot name - creates a snapshot when provided')
  .option('-g, --group <id>', 'Chapter ID')
  .option('-c, --category <name>', 'Category label')
  .option('-t, --tag <tags...>', 'Tags to apply')
  .option('-d, --desc <description>', 'Version description')
  .action(async (name, opts) => {
    if (name) {
      await runSnap(name, opts);
    } else {
      // Interactive TUI - will be implemented in Phase 4
      const { runInteractiveTUI } = await import('./tui/index.js');
      await runInteractiveTUI();
    }
  });

program.addCommand(actionCommand);
program.addCommand(initCommand);
program.addCommand(serveCommand);
program.addCommand(snapCommand, { hidden: true });
program.addCommand(listCommand);
program.addCommand(newCommand);
program.addCommand(chapterCommand);
program.addCommand(groupCommand, { hidden: true });
program.addCommand(restoreCommand);
program.addCommand(tagCommand);
program.addCommand(starCommand);
program.addCommand(noteCommand);
program.addCommand(rmCommand);
program.addCommand(contextCommand);
program.addCommand(briefCommand);
program.addCommand(exportCommand);

program.parse();
