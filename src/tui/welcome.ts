import path from 'node:path';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { storage } from '../core/storage.js';
import { createSnapshot } from '../core/snapshot.js';
import { buildProjectTree, printProjectTree } from '../core/project-tree.js';

export async function runWelcome(): Promise<{ prototypeId: string; groupId: string }> {
  p.intro(chalk.bgHex('#6d5cff').white(' snap '));

  p.log.info('Snap saves snapshots of your coded prototypes so you can flip between them.');

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
    message: 'Snap your current files now?',
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

    s2.stop(`Snapshot "${snapName}" saved (${version.fileCount} files)`);
  }

  // Show what was created using the same tree format as snap action
  console.log('');
  const tree = await buildProjectTree(proto.id);
  printProjectTree(tree);
  console.log('');

  p.outro('You\'re all set!');

  return { prototypeId: proto.id, groupId: group.id };
}
