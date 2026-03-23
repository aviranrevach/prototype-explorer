import { Router } from 'express';
import path from 'node:path';
import fs from 'fs-extra';
import { storage } from '../core/storage.js';
import { createSnapshot, restoreVersion } from '../core/snapshot.js';
import { buildExportData, toMarkdown } from '../commands/export.js';

export const apiRouter = Router();

function ok<T>(data: T) {
  return { success: true, data };
}

function err(message: string) {
  return { success: false, error: message };
}

// Config
apiRouter.get('/config', async (_req, res) => {
  const config = await storage.getConfig();
  res.json(ok(config));
});

// ── Prototypes CRUD ──

apiRouter.get('/prototypes', async (_req, res) => {
  const protos = await storage.listPrototypes();
  res.json(ok(protos));
});

apiRouter.post('/prototypes', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json(err('Name is required'));
  const proto = await storage.createPrototype({ name, description });
  res.status(201).json(ok(proto));
});

apiRouter.get('/prototypes/:id', async (req, res) => {
  const proto = await storage.getPrototype(req.params.id);
  if (!proto) return res.status(404).json(err('Not found'));
  res.json(ok(proto));
});

apiRouter.delete('/prototypes/:id', async (req, res) => {
  await storage.deletePrototype(req.params.id);
  res.json(ok({ deleted: true }));
});

// ── Version Groups ──

apiRouter.get('/prototypes/:id/groups', async (req, res) => {
  const groups = await storage.listGroups(req.params.id);
  res.json(ok(groups));
});

apiRouter.post('/prototypes/:id/groups', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json(err('Name is required'));
  const group = await storage.createGroup(req.params.id, { name, description });
  res.status(201).json(ok(group));
});

apiRouter.get('/prototypes/:id/groups/:gid', async (req, res) => {
  const group = await storage.getGroup(req.params.id, req.params.gid);
  if (!group) return res.status(404).json(err('Not found'));
  res.json(ok(group));
});

apiRouter.patch('/prototypes/:id/groups/:gid', async (req, res) => {
  const updated = await storage.updateGroup(req.params.id, req.params.gid, req.body);
  if (!updated) return res.status(404).json(err('Not found'));
  res.json(ok(updated));
});

apiRouter.delete('/prototypes/:id/groups/:gid', async (req, res) => {
  await storage.deleteGroup(req.params.id, req.params.gid);
  res.json(ok({ deleted: true }));
});

apiRouter.get('/prototypes/:id/groups/:gid/versions', async (req, res) => {
  const versions = await storage.listVersions(req.params.id, req.params.gid);
  res.json(ok(versions));
});

// ── Versions CRUD ──

apiRouter.get('/prototypes/:id/versions', async (req, res) => {
  let versions = await storage.listVersions(req.params.id);
  const tag = req.query.tag as string | undefined;
  const groupId = req.query.groupId as string | undefined;
  if (groupId) {
    versions = versions.filter((v) => v.groupId === groupId);
  }
  if (tag) {
    versions = versions.filter((v) => v.tags.includes(tag));
  }
  res.json(ok(versions));
});

apiRouter.post('/prototypes/:id/versions', async (req, res) => {
  const { name, description, tags, author, groupId, category } = req.body;
  if (!name) return res.status(400).json(err('Name is required'));
  if (!groupId) return res.status(400).json(err('groupId is required'));
  try {
    const version = await createSnapshot(req.params.id, {
      name,
      groupId,
      category,
      description,
      tags,
      author,
    });
    res.status(201).json(ok(version));
  } catch (e: any) {
    res.status(500).json(err(e.message));
  }
});

apiRouter.get('/prototypes/:id/versions/:vid', async (req, res) => {
  const version = await storage.getVersion(req.params.vid);
  if (!version) return res.status(404).json(err('Not found'));
  res.json(ok(version));
});

apiRouter.patch('/prototypes/:id/versions/:vid', async (req, res) => {
  const updated = await storage.updateVersion(req.params.vid, req.body);
  if (!updated) return res.status(404).json(err('Not found'));
  res.json(ok(updated));
});

apiRouter.delete('/prototypes/:id/versions/:vid', async (req, res) => {
  await storage.deleteVersion(req.params.id, req.params.vid);
  res.json(ok({ deleted: true }));
});

// Restore
apiRouter.post('/prototypes/:id/versions/:vid/restore', async (req, res) => {
  try {
    await restoreVersion(req.params.vid);
    res.json(ok({ restored: true }));
  } catch (e: any) {
    res.status(500).json(err(e.message));
  }
});

// ── Context & Briefs ──

apiRouter.get('/context', async (_req, res) => {
  const text = await storage.readContext();
  res.json(ok(text || ''));
});

apiRouter.put('/context', async (req, res) => {
  const { text } = req.body;
  if (typeof text !== 'string') return res.status(400).json(err('text is required'));
  await storage.writeContext(text);
  res.json(ok({ saved: true }));
});

apiRouter.get('/prototypes/:id/groups/:gid/brief', async (req, res) => {
  const brief = await storage.readGroupBrief(req.params.id, req.params.gid);
  res.json(ok(brief || ''));
});

apiRouter.put('/prototypes/:id/groups/:gid/brief', async (req, res) => {
  const { text } = req.body;
  if (typeof text !== 'string') return res.status(400).json(err('text is required'));
  await storage.writeGroupBrief(req.params.id, req.params.gid, text);
  res.json(ok({ saved: true }));
});

// ── Export ──

apiRouter.get('/export', async (req, res) => {
  const groupId = req.query.group as string | undefined;
  const format = req.query.format as string | undefined;
  const data = await buildExportData(groupId);
  if (format === 'json') {
    res.json(ok(data));
  } else {
    res.json(ok(toMarkdown(data)));
  }
});

// Preview - serve version files
apiRouter.get('/prototypes/:id/versions/:vid/preview', async (req, res) => {
  const version = await storage.getVersion(req.params.vid);
  if (!version) return res.status(404).json(err('Not found'));

  const filesDir = storage.getVersionFilesDir(req.params.id, req.params.vid);
  if (!(await fs.pathExists(filesDir))) return res.status(404).json(err('No files'));

  const indexPath = path.join(filesDir, 'index.html');
  if (await fs.pathExists(indexPath)) {
    const html = await fs.readFile(indexPath, 'utf-8');
    return res.type('html').send(html);
  }

  const files = await fs.readdir(filesDir, { recursive: true });
  const htmlFiles = (files as string[]).filter((f) => f.endsWith('.html'));
  if (htmlFiles.length > 0) {
    const html = await fs.readFile(path.join(filesDir, htmlFiles[0]), 'utf-8');
    return res.type('html').send(html);
  }

  res.status(404).json(err('No HTML file found for preview'));
});

// Serve static version files (css, js, images, etc.)
apiRouter.use('/prototypes/:id/versions/:vid/files', async (req, res, next) => {
  const filesDir = storage.getVersionFilesDir(req.params.id, req.params.vid);
  const filePath = path.join(filesDir, req.path);
  if (await fs.pathExists(filePath)) {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
      '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
      '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
    };
    res.type(mimeTypes[ext] || 'application/octet-stream').send(content);
    return;
  }
  next();
});
