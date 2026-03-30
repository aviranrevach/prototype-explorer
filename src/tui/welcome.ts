import path from 'node:path';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { storage } from '../core/storage.js';
import { createSnapshot } from '../core/snapshot.js';

export async function runWelcome(): Promise<{ prototypeId: string; groupId: string }> {
  p.intro(chalk.bgHex('#6d5cff').white(' snap '));

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
    message: 'First chapter name',
    placeholder: 'v1',
    defaultValue: 'v1',
  });

  if (p.isCancel(groupName)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  const group = await storage.createGroup(proto.id, { name: groupName });

  const shouldSnap = await p.confirm({
    message: 'Take your first snap now?',
    initialValue: true,
  });

  if (p.isCancel(shouldSnap)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  if (shouldSnap) {
    const snapName = await p.text({
      message: 'Snap name',
      placeholder: 'Initial',
      defaultValue: 'Initial',
    });

    if (p.isCancel(snapName)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }

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

  p.outro(`You're all set! Run ${chalk.cyan('snap serve')} to explore.`);

  return { prototypeId: proto.id, groupId: group.id };
}
