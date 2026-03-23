import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { serveCommand } from './commands/serve.js';
import { snapCommand } from './commands/snap.js';
import { listCommand } from './commands/list.js';
import { newCommand } from './commands/new.js';
import { groupCommand } from './commands/group.js';
import { restoreCommand } from './commands/restore.js';
import { tagCommand } from './commands/tag.js';
import { starCommand } from './commands/star.js';
import { noteCommand } from './commands/note.js';
import { rmCommand } from './commands/rm.js';
import { contextCommand } from './commands/context.js';
import { briefCommand } from './commands/brief.js';
import { exportCommand } from './commands/export.js';

const program = new Command();

program
  .name('proto-explorer')
  .description('Organize, version, and explore prototypes inside your coding project')
  .version('0.1.0');

program.addCommand(initCommand);
program.addCommand(serveCommand);
program.addCommand(snapCommand);
program.addCommand(listCommand);
program.addCommand(newCommand);
program.addCommand(groupCommand);
program.addCommand(restoreCommand);
program.addCommand(tagCommand);
program.addCommand(starCommand);
program.addCommand(noteCommand);
program.addCommand(rmCommand);
program.addCommand(contextCommand);
program.addCommand(briefCommand);
program.addCommand(exportCommand);

program.parse();
