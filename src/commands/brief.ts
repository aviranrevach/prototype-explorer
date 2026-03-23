import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'node:child_process';
import { storage } from '../core/storage.js';

export const briefCommand = new Command('brief')
  .description('View or set a brief for a version group')
  .argument('[group-id]', 'Group ID (defaults to first group of first prototype)')
  .argument('[text...]', 'Brief text to set (omit to view)')
  .option('--edit', 'Open brief in $EDITOR')
  .option('-p, --prototype <id>', 'Prototype ID')
  .action(async (groupId: string | undefined, textParts: string[], opts: { edit?: boolean; prototype?: string }) => {
    const config = await storage.getConfig();
    if (!config) {
      console.log(chalk.yellow('Not initialized. Run `proto-explorer init` first.'));
      return;
    }

    const prototypes = await storage.listPrototypes();
    if (prototypes.length === 0) {
      console.log(chalk.dim('No prototypes yet.'));
      return;
    }

    let protoId = opts.prototype;
    if (!protoId) {
      protoId = prototypes[0].id;
    }

    const proto = await storage.getPrototype(protoId);
    if (!proto) {
      console.log(chalk.red('Prototype not found'));
      return;
    }

    const groups = await storage.listGroups(protoId);
    if (groups.length === 0) {
      console.log(chalk.dim('No groups in this prototype.'));
      return;
    }

    let targetGroup = groupId
      ? groups.find((g) => g.id === groupId || g.name.toLowerCase() === groupId.toLowerCase())
      : groups[0];

    if (!targetGroup) {
      console.log(chalk.red(`Group "${groupId}" not found.`));
      console.log(chalk.dim('Available groups:'));
      for (const g of groups) {
        console.log(chalk.dim(`  ${g.name} ${chalk.dim(g.id)}`));
      }
      return;
    }

    if (opts.edit) {
      const editor = process.env.EDITOR || process.env.VISUAL || 'nano';
      const existing = await storage.readGroupBrief(protoId, targetGroup.id);
      if (!existing) {
        await storage.writeGroupBrief(protoId, targetGroup.id, `# ${targetGroup.name}\n\n<!-- Describe this version group's direction, goals, and constraints -->\n`);
      }
      try {
        const briefPath = `${storage.root()}/prototypes/${protoId}/groups/${targetGroup.id}/brief.md`;
        execSync(`${editor} "${briefPath}"`, { stdio: 'inherit' });
      } catch {
        console.log(chalk.yellow('Could not open editor. Set $EDITOR to your preferred editor.'));
      }
      return;
    }

    const text = textParts.join(' ').trim();
    if (text) {
      await storage.writeGroupBrief(protoId, targetGroup.id, text);
      console.log(chalk.green('✓') + ` Brief saved for ${chalk.bold(targetGroup.name)}`);
      return;
    }

    const brief = await storage.readGroupBrief(protoId, targetGroup.id);
    if (!brief) {
      console.log(chalk.dim(`No brief for "${targetGroup.name}" yet.`));
      console.log(chalk.dim(`Set one: proto-explorer brief ${targetGroup.id} "Your brief text"`));
      return;
    }
    console.log(chalk.bold(targetGroup.name));
    console.log(brief);
  });
