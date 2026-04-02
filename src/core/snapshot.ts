import path from 'node:path';
import fs from 'fs-extra';
import { storage } from './storage.js';
import type { PrototypeVersion } from './types.js';

export async function createSnapshot(
  prototypeId: string,
  opts: {
    name: string;
    groupId: string;
    category?: string;
    description?: string;
    tags?: string[];
    author?: string;
  },
): Promise<PrototypeVersion> {
  const config = await storage.getConfig();
  const sourceFile = config?.sourceFile || 'index.html';
  const sourcePath = path.resolve(process.cwd(), sourceFile);

  if (!(await fs.pathExists(sourcePath))) {
    throw new Error(
      `No ${sourceFile} found in project root. Create one first, or run 'snapp init'.`,
    );
  }

  const version = await storage.createVersion(prototypeId, {
    name: opts.name,
    groupId: opts.groupId,
    category: opts.category || 'Scenarios',
    description: opts.description,
    tags: opts.tags || [],
    starred: false,
    author: opts.author || config?.defaultAuthor || 'Anonymous',
    timestamp: new Date().toISOString(),
    fileCount: 1,
  });

  const destDir = storage.getVersionFilesDir(prototypeId, version.id);
  await fs.ensureDir(destDir);
  await fs.copy(sourcePath, path.join(destDir, 'index.html'));

  return version;
}

export async function restoreVersion(versionId: string): Promise<void> {
  const version = await storage.getVersion(versionId);
  if (!version) throw new Error(`Version ${versionId} not found`);

  const config = await storage.getConfig();
  const sourceFile = config?.sourceFile || 'index.html';

  const filesDir = storage.getVersionFilesDir(version.prototypeId, versionId);
  const storedFile = path.join(filesDir, 'index.html');

  if (!(await fs.pathExists(storedFile))) {
    throw new Error('No HTML file stored for this version');
  }

  const dest = path.resolve(process.cwd(), sourceFile);
  await fs.copy(storedFile, dest, { overwrite: true });
}
