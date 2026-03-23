import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes.js';
import { storage } from '../core/storage.js';

export async function createServer() {
  await storage.migrateToGroups();

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', apiRouter);

  const explorerDist = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../explorer/dist',
  );
  app.use(express.static(explorerDist));
  app.get(/^\/(?!api).*/, async (_req, res) => {
    const indexPath = path.join(explorerDist, 'index.html');
    const html = await fs.readFile(indexPath, 'utf-8');
    res.type('html').send(html);
  });

  return app;
}
