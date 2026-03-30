import path from 'node:path';
import chalk from 'chalk';
import { storage } from './storage.js';

export async function ensureInit(): Promise<{ prototypeId: string; groupId: string }> {
  let config = await storage.getConfig();

  if (!config) {
    const projectName = path.basename(process.cwd()) || 'my-project';
    config = await storage.init(projectName);
    console.log(chalk.dim('  Initialized .proto-explorer'));
  }

  let protos = await storage.listPrototypes();
  if (protos.length === 0) {
    const proto = await storage.createPrototype({ name: config.projectName });
    protos = [proto];
    console.log(chalk.dim(`  Created prototype "${config.projectName}"`));
  }

  const prototypeId = protos[0].id;
  let groups = await storage.listGroups(prototypeId);
  if (groups.length === 0) {
    const group = await storage.createGroup(prototypeId, { name: 'Default' });
    groups = [group];
    console.log(chalk.dim('  Created default chapter'));
  }

  return { prototypeId, groupId: groups[0].id };
}
