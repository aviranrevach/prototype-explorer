import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'glob';
import { storage } from './storage.js';
import type { PrototypeVersion } from './types.js';

const IGNORE_PATTERNS = [
  'node_modules/**',
  '.proto-explorer/**',
  '.git/**',
  'dist/**',
  '.next/**',
  '.nuxt/**',
  '.svelte-kit/**',
  '*.lock',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
];

async function collectFiles(trackedPaths: string[]): Promise<string[]> {
  const files: Set<string> = new Set();
  for (const tracked of trackedPaths) {
    const pattern = tracked === '.' ? '**/*' : `${tracked}/**/*`;
    const matches = await glob(pattern, {
      ignore: IGNORE_PATTERNS,
      nodir: true,
      dot: false,
      cwd: process.cwd(),
    });
    for (const m of matches) files.add(m);
  }
  return [...files].sort();
}

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
  const trackedPaths = config?.trackedPaths || ['.'];
  const files = await collectFiles(trackedPaths);

  const version = await storage.createVersion(prototypeId, {
    name: opts.name,
    groupId: opts.groupId,
    category: opts.category || 'Scenarios',
    description: opts.description,
    tags: opts.tags || [],
    starred: false,
    author: opts.author || config?.defaultAuthor || 'Anonymous',
    timestamp: new Date().toISOString(),
    fileCount: files.length,
  });

  const destDir = storage.getVersionFilesDir(prototypeId, version.id);
  for (const file of files) {
    const src = path.resolve(process.cwd(), file);
    const dest = path.join(destDir, file);
    await fs.ensureDir(path.dirname(dest));
    await fs.copy(src, dest);
  }

  return version;
}

export async function restoreVersion(versionId: string): Promise<void> {
  const version = await storage.getVersion(versionId);
  if (!version) throw new Error(`Version ${versionId} not found`);

  const filesDir = storage.getVersionFilesDir(version.prototypeId, versionId);
  if (!(await fs.pathExists(filesDir))) throw new Error('No files stored for this version');

  const files = await glob('**/*', { cwd: filesDir, nodir: true, dot: false });
  for (const file of files) {
    const src = path.join(filesDir, file);
    const dest = path.resolve(process.cwd(), file);
    await fs.ensureDir(path.dirname(dest));
    await fs.copy(src, dest, { overwrite: true });
  }
}
