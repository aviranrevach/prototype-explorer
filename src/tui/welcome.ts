import path from 'node:path';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import { storage } from '../core/storage.js';
import { createSnapshot } from '../core/snapshot.js';
import { buildProjectTree, printProjectTree } from '../core/project-tree.js';
import { STARTER_HTML } from '../commands/init.js';

export async function runWelcome(): Promise<{ prototypeId: string; groupId: string }> {
  p.intro(chalk.bgHex('#6d5cff').white(' snapp '));

  p.log.info('Snapp saves snapshots of your HTML prototypes so you can flip between them.');

  const projectName = await p.text({
    message: 'Name your project',
    placeholder: path.basename(process.cwd()),
    defaultValue: path.basename(process.cwd()),
  });

  if (p.isCancel(projectName)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  const s = p.spinner();
  s.start('Setting up');

  const config = await storage.init(projectName);
  const proto = await storage.createPrototype({ name: projectName });

  // Create starter index.html if it doesn't exist
  const htmlPath = path.resolve(process.cwd(), 'index.html');
  if (!(await fs.pathExists(htmlPath))) {
    await fs.writeFile(htmlPath, STARTER_HTML, 'utf-8');
  }

  s.stop('Project created');

  const groupName = await p.text({
    message: 'First chapter name (a chapter is a round of exploration, like "v1" or "Dark Theme")',
    placeholder: 'v1',
    defaultValue: 'v1',
  });

  if (p.isCancel(groupName)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  const group = await storage.createGroup(proto.id, { name: groupName });

  const shouldSnap = await p.confirm({
    message: 'Snap your current index.html now?',
    initialValue: true,
  });

  if (p.isCancel(shouldSnap)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  let snapName: string | undefined;

  if (shouldSnap) {
    const name = await p.text({
      message: 'Give this snap a name',
      placeholder: 'Initial',
      defaultValue: 'Initial',
      validate: (val) => {
        if (!val?.trim()) return 'Name cannot be empty';
      },
    });

    if (p.isCancel(name)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }

    snapName = name;

    const s2 = p.spinner();
    s2.start('Snapping');

    const version = await createSnapshot(proto.id, {
      name: snapName,
      groupId: group.id,
      category: 'Scenarios',
      tags: [],
      author: config.defaultAuthor,
    });

    s2.stop(`Snapshot "${snapName}" saved`);
  }

  // Show what was created using the same tree format as snapp action
  console.log('');
  const tree = await buildProjectTree(proto.id);
  printProjectTree(tree);
  console.log('');

  p.outro('You\'re all set! Edit index.html and run snapp "name" to save snapshots.');

  return { prototypeId: proto.id, groupId: group.id };
}
