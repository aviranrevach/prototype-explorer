import path from 'node:path';
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import { storage } from '../core/storage.js';

const STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Prototype</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, sans-serif;
      background: #0a0a0f;
      color: #fff;
    }
    .card {
      max-width: 480px;
      padding: 3rem;
      text-align: center;
      border-radius: 1.5rem;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.02);
    }
    h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
    p { color: #888; font-size: 0.95rem; line-height: 1.6; }
  </style>
</head>
<body>
  <!-- Edit this file, then run: snapp "My Design" -->
  <div class="card">
    <h1>My Prototype</h1>
    <p>Edit this file and start designing. Run <code>snapp "My Design"</code> to save a snapshot.</p>
  </div>
</body>
</html>`;

export { STARTER_HTML };

export const initCommand = new Command('init')
  .description('Initialize Snapp in the current project')
  .option('-n, --name <name>', 'Project name')
  .action(async (opts) => {
    const existing = await storage.getConfig();
    if (existing) {
      console.log(chalk.yellow('Already initialized. Config found at .proto-explorer/config.json'));
      return;
    }

    const projectName = opts.name || process.cwd().split('/').pop() || 'my-project';
    await storage.init(projectName);

    const htmlPath = path.resolve(process.cwd(), 'index.html');
    if (!(await fs.pathExists(htmlPath))) {
      await fs.writeFile(htmlPath, STARTER_HTML, 'utf-8');
      console.log(chalk.green('\u2713') + ' Created index.html with starter template');
    }

    console.log(chalk.green('\u2713') + ' Snapp initialized');
    console.log(chalk.dim(`  Edit index.html, then run ${chalk.cyan('snapp "My Design"')} to save a snapshot`));
  });
