import path from 'node:path';
import fs from 'fs-extra';
import { nanoid } from 'nanoid';
import type {
  ProtoExplorerConfig,
  Prototype,
  VersionGroup,
  PrototypeVersion,
  CreatePrototypeRequest,
  CreateGroupRequest,
  UpdateVersionRequest,
} from './types.js';

const ROOT = '.proto-explorer';

function root() {
  return path.resolve(process.cwd(), ROOT);
}

function configPath() {
  return path.join(root(), 'config.json');
}

function prototypesDir() {
  return path.join(root(), 'prototypes');
}

function protoDir(protoId: string) {
  return path.join(prototypesDir(), protoId);
}

function groupsDir(protoId: string) {
  return path.join(protoDir(protoId), 'groups');
}

function groupDir(protoId: string, groupId: string) {
  return path.join(groupsDir(protoId), groupId);
}

function versionsDir(protoId: string) {
  return path.join(protoDir(protoId), 'versions');
}

function versionDir(protoId: string, versionId: string) {
  return path.join(versionsDir(protoId), versionId);
}

function versionFilesDir(protoId: string, versionId: string) {
  return path.join(versionDir(protoId, versionId), 'files');
}

// ── Config ──

async function init(projectName: string): Promise<ProtoExplorerConfig> {
  const config: ProtoExplorerConfig = {
    version: '0.1.0',
    projectName,
    trackedPaths: ['.'],
    defaultAuthor: 'Anonymous',
  };
  await fs.ensureDir(root());
  await fs.ensureDir(prototypesDir());
  await fs.writeJson(configPath(), config, { spaces: 2 });
  return config;
}

async function getConfig(): Promise<ProtoExplorerConfig | null> {
  try {
    return await fs.readJson(configPath());
  } catch {
    return null;
  }
}

// ── Prototypes ──

async function listPrototypes(): Promise<Prototype[]> {
  const dir = prototypesDir();
  if (!(await fs.pathExists(dir))) return [];
  const entries = await fs.readdir(dir);
  const protos: Prototype[] = [];
  for (const entry of entries) {
    const metaPath = path.join(dir, entry, 'meta.json');
    if (await fs.pathExists(metaPath)) {
      protos.push(await fs.readJson(metaPath));
    }
  }
  return protos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function getPrototype(id: string): Promise<Prototype | null> {
  const metaPath = path.join(protoDir(id), 'meta.json');
  if (!(await fs.pathExists(metaPath))) return null;
  return fs.readJson(metaPath);
}

async function createPrototype(req: CreatePrototypeRequest): Promise<Prototype> {
  const id = nanoid(10);
  const now = new Date().toISOString();
  const proto: Prototype = {
    id,
    name: req.name,
    description: req.description || '',
    createdAt: now,
    updatedAt: now,
  };
  await fs.ensureDir(protoDir(id));
  await fs.ensureDir(versionsDir(id));
  await fs.ensureDir(groupsDir(id));
  await fs.writeJson(path.join(protoDir(id), 'meta.json'), proto, { spaces: 2 });
  return proto;
}

async function deletePrototype(id: string): Promise<void> {
  await fs.remove(protoDir(id));
}

// ── Version Groups ──

async function listGroups(prototypeId: string): Promise<VersionGroup[]> {
  const dir = groupsDir(prototypeId);
  if (!(await fs.pathExists(dir))) return [];
  const entries = await fs.readdir(dir);
  const groups: VersionGroup[] = [];
  for (const entry of entries) {
    const metaPath = path.join(dir, entry, 'meta.json');
    if (await fs.pathExists(metaPath)) {
      groups.push(await fs.readJson(metaPath));
    }
  }
  return groups.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function getGroup(prototypeId: string, groupId: string): Promise<VersionGroup | null> {
  const metaPath = path.join(groupDir(prototypeId, groupId), 'meta.json');
  if (!(await fs.pathExists(metaPath))) return null;
  return fs.readJson(metaPath);
}

async function createGroup(prototypeId: string, req: CreateGroupRequest): Promise<VersionGroup> {
  const id = nanoid(10);
  const now = new Date().toISOString();
  const group: VersionGroup = {
    id,
    prototypeId,
    name: req.name,
    description: req.description,
    createdAt: now,
    updatedAt: now,
  };
  const dir = groupDir(prototypeId, id);
  await fs.ensureDir(dir);
  await fs.writeJson(path.join(dir, 'meta.json'), group, { spaces: 2 });

  const protoMeta = path.join(protoDir(prototypeId), 'meta.json');
  if (await fs.pathExists(protoMeta)) {
    const proto = await fs.readJson(protoMeta);
    proto.updatedAt = now;
    await fs.writeJson(protoMeta, proto, { spaces: 2 });
  }

  return group;
}

async function updateGroup(
  prototypeId: string,
  groupId: string,
  updates: Partial<Pick<VersionGroup, 'name' | 'description'>>,
): Promise<VersionGroup | null> {
  const group = await getGroup(prototypeId, groupId);
  if (!group) return null;
  const updated = { ...group, ...updates, updatedAt: new Date().toISOString() };
  await fs.writeJson(path.join(groupDir(prototypeId, groupId), 'meta.json'), updated, { spaces: 2 });
  return updated;
}

async function deleteGroup(prototypeId: string, groupId: string): Promise<void> {
  const versions = await listVersions(prototypeId, groupId);
  for (const v of versions) {
    await deleteVersion(prototypeId, v.id);
  }
  await fs.remove(groupDir(prototypeId, groupId));
}

// ── Versions ──

async function listVersions(prototypeId: string, groupId?: string): Promise<PrototypeVersion[]> {
  const dir = versionsDir(prototypeId);
  if (!(await fs.pathExists(dir))) return [];
  const entries = await fs.readdir(dir);
  const versions: PrototypeVersion[] = [];
  for (const entry of entries) {
    const metaPath = path.join(dir, entry, 'meta.json');
    if (await fs.pathExists(metaPath)) {
      const v: PrototypeVersion = await fs.readJson(metaPath);
      if (!groupId || v.groupId === groupId) {
        versions.push(v);
      }
    }
  }
  return versions.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

async function getVersion(versionId: string): Promise<PrototypeVersion | null> {
  const protos = await listPrototypes();
  for (const proto of protos) {
    const metaPath = path.join(versionsDir(proto.id), versionId, 'meta.json');
    if (await fs.pathExists(metaPath)) {
      return fs.readJson(metaPath);
    }
  }
  return null;
}

async function createVersion(
  prototypeId: string,
  data: Omit<PrototypeVersion, 'id' | 'prototypeId'>,
): Promise<PrototypeVersion> {
  const id = nanoid(10);
  const version: PrototypeVersion = { id, prototypeId, ...data };
  const dir = versionDir(prototypeId, id);
  await fs.ensureDir(dir);
  await fs.ensureDir(versionFilesDir(prototypeId, id));
  await fs.writeJson(path.join(dir, 'meta.json'), version, { spaces: 2 });

  const protoMeta = path.join(protoDir(prototypeId), 'meta.json');
  if (await fs.pathExists(protoMeta)) {
    const proto = await fs.readJson(protoMeta);
    proto.updatedAt = new Date().toISOString();
    await fs.writeJson(protoMeta, proto, { spaces: 2 });
  }

  const gDir = groupDir(prototypeId, data.groupId);
  const gMeta = path.join(gDir, 'meta.json');
  if (await fs.pathExists(gMeta)) {
    const g = await fs.readJson(gMeta);
    g.updatedAt = new Date().toISOString();
    await fs.writeJson(gMeta, g, { spaces: 2 });
  }

  return version;
}

async function updateVersion(versionId: string, updates: UpdateVersionRequest): Promise<PrototypeVersion | null> {
  const version = await getVersion(versionId);
  if (!version) return null;
  const updated = { ...version, ...updates };
  const metaPath = path.join(versionsDir(version.prototypeId), versionId, 'meta.json');
  await fs.writeJson(metaPath, updated, { spaces: 2 });
  return updated;
}

async function deleteVersion(prototypeId: string, versionId: string): Promise<void> {
  await fs.remove(versionDir(prototypeId, versionId));
}

function getVersionFilesDir(prototypeId: string, versionId: string): string {
  return versionFilesDir(prototypeId, versionId);
}

// ── Context & Briefs ──

function contextPath() {
  return path.join(root(), 'context.md');
}

function groupBriefPath(protoId: string, groupId: string) {
  return path.join(groupDir(protoId, groupId), 'brief.md');
}

async function readContext(): Promise<string | null> {
  const p = contextPath();
  if (!(await fs.pathExists(p))) return null;
  return fs.readFile(p, 'utf-8');
}

async function writeContext(text: string): Promise<void> {
  await fs.ensureDir(root());
  await fs.writeFile(contextPath(), text, 'utf-8');
}

async function readGroupBrief(protoId: string, groupId: string): Promise<string | null> {
  const p = groupBriefPath(protoId, groupId);
  if (!(await fs.pathExists(p))) return null;
  return fs.readFile(p, 'utf-8');
}

async function writeGroupBrief(protoId: string, groupId: string, text: string): Promise<void> {
  await fs.ensureDir(groupDir(protoId, groupId));
  await fs.writeFile(groupBriefPath(protoId, groupId), text, 'utf-8');
}

async function listVersionFiles(protoId: string, versionId: string): Promise<string[]> {
  const dir = versionFilesDir(protoId, versionId);
  if (!(await fs.pathExists(dir))) return [];
  const files = await fs.readdir(dir, { recursive: true });
  return (files as string[]).filter((f) => !f.startsWith('.'));
}

// ── Migration: assign existing versions to a default group ──

async function migrateToGroups(): Promise<void> {
  const protos = await listPrototypes();
  for (const proto of protos) {
    const versions = await listVersions(proto.id);
    const needsMigration = versions.some((v) => !v.groupId);
    if (!needsMigration) continue;

    await fs.ensureDir(groupsDir(proto.id));
    const groups = await listGroups(proto.id);
    let defaultGroup = groups.find((g) => g.name === 'Default');
    if (!defaultGroup) {
      defaultGroup = await createGroup(proto.id, { name: 'Default', description: 'Auto-created during migration' });
    }

    for (const v of versions) {
      if (v.groupId) continue;
      const updated = { ...v, groupId: defaultGroup.id, category: v.category || 'Scenarios' };
      const metaPath = path.join(versionsDir(proto.id), v.id, 'meta.json');
      await fs.writeJson(metaPath, updated, { spaces: 2 });
    }
  }
}

export const storage = {
  root,
  init,
  getConfig,
  listPrototypes,
  getPrototype,
  createPrototype,
  deletePrototype,
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  listVersions,
  getVersion,
  createVersion,
  updateVersion,
  deleteVersion,
  getVersionFilesDir,
  migrateToGroups,
  readContext,
  writeContext,
  readGroupBrief,
  writeGroupBrief,
  listVersionFiles,
  protoDir,
  groupsDir,
  versionsDir,
  versionDir,
};
