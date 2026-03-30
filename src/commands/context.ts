import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'node:child_process';
import { storage } from '../core/storage.js';
import { ensureInit } from '../core/ensure-init.js';

async function generateContextMarkdown(): Promise<string> {
  const config = await storage.getConfig();
  const lines: string[] = [];

  lines.push(`# ${config?.projectName || 'Untitled Project'}`);
  lines.push('');
  lines.push('> Auto-generated project context. Edit freely — this is your collaboration memory.');
  lines.push('');

  const prototypes = await storage.listPrototypes();
  if (prototypes.length === 0) {
    lines.push('No prototypes yet.');
    return lines.join('\n');
  }

  lines.push('## Overview');
  lines.push('');

  let totalVersions = 0;
  let totalGroups = 0;
  for (const proto of prototypes) {
    const groups = await storage.listGroups(proto.id);
    const versions = await storage.listVersions(proto.id);
    totalGroups += groups.length;
    totalVersions += versions.length;
  }
  lines.push(`- **${prototypes.length}** prototype${prototypes.length === 1 ? '' : 's'}`);
  lines.push(`- **${totalGroups}** version group${totalGroups === 1 ? '' : 's'}`);
  lines.push(`- **${totalVersions}** total version${totalVersions === 1 ? '' : 's'}`);
  lines.push('');

  lines.push('## Structure');
  lines.push('');

  for (const proto of prototypes) {
    lines.push(`### ${proto.name}`);
    if (proto.description) lines.push(`${proto.description}`);
    lines.push('');

    const groups = await storage.listGroups(proto.id);
    for (const group of groups) {
      const brief = await storage.readGroupBrief(proto.id, group.id);
      const versions = await storage.listVersions(proto.id, group.id);
      lines.push(`#### ${group.name} (${versions.length} versions)`);
      if (group.description) lines.push(`${group.description}`);
      if (brief) lines.push(`\n${brief}`);
      lines.push('');

      const byCategory = new Map<string, typeof versions>();
      for (const v of versions) {
        const cat = v.category || 'Uncategorized';
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        byCategory.get(cat)!.push(v);
      }

      for (const [cat, catVersions] of byCategory) {
        lines.push(`**${cat}:**`);
        const scenarioNames = [...new Set(catVersions.map((v) => v.name))];
        for (const name of scenarioNames) {
          const subs = catVersions.filter((v) => v.name === name);
          const subLabel = subs.length > 1 ? ` (${subs.length} sub-versions)` : '';
          const tags = subs[0].tags.length > 0 ? ` [${subs[0].tags.join(', ')}]` : '';
          const star = subs[0].starred ? ' ★' : '';
          lines.push(`- ${name}${subLabel}${tags}${star}`);
          if (subs[0].notes) lines.push(`  - Note: ${subs[0].notes}`);
          if (subs[0].description) lines.push(`  - ${subs[0].description}`);
        }
        lines.push('');
      }
    }
  }

  lines.push('## Goals');
  lines.push('');
  lines.push('<!-- Describe what this project is trying to achieve -->');
  lines.push('');
  lines.push('## Decisions');
  lines.push('');
  lines.push('<!-- Key design decisions and why they were made -->');
  lines.push('');
  lines.push('## Status');
  lines.push('');
  lines.push('<!-- Where things stand right now -->');
  lines.push('');

  return lines.join('\n');
}

export const contextCommand = new Command('context')
  .description('View, edit, or generate project context for collaboration and AI')
  .argument('[action]', 'show (default), edit, or generate', 'show')
  .option('--yes', 'Skip confirmation when generating')
  .action(async (action: string, opts: { yes?: boolean }) => {
    await ensureInit();

    if (action === 'generate') {
      const md = await generateContextMarkdown();

      if (!opts.yes) {
        console.log(chalk.dim('─'.repeat(60)));
        console.log(md);
        console.log(chalk.dim('─'.repeat(60)));
        console.log('');
        console.log(chalk.cyan('This will be written to .snap/context.md'));
        console.log(chalk.dim('Run with --yes to skip this preview.'));
      }

      await storage.writeContext(md);
      console.log(chalk.green('✓') + ' Context generated → .snap/context.md');
      return;
    }

    if (action === 'edit') {
      const editor = process.env.EDITOR || process.env.VISUAL || 'nano';
      const existing = await storage.readContext();
      if (!existing) {
        const md = await generateContextMarkdown();
        await storage.writeContext(md);
        console.log(chalk.dim('Generated initial context file.'));
      }
      try {
        execSync(`${editor} "${storage.root()}/context.md"`, { stdio: 'inherit' });
      } catch {
        console.log(chalk.yellow(`Could not open editor (${editor}). Set $EDITOR to your preferred editor.`));
      }
      return;
    }

    const text = await storage.readContext();
    if (!text) {
      console.log(chalk.dim('No context file yet. Run `snap context generate` to create one.'));
      return;
    }
    console.log(text);
  });
