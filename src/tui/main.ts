import * as p from '@clack/prompts';
import chalk from 'chalk';
import { storage } from '../core/storage.js';
import { createSnapshot } from '../core/snapshot.js';
import { restoreVersion } from '../core/snapshot.js';
import type { PrototypeVersion, VersionGroup } from '../core/types.js';

interface TUIState {
  prototypeId: string;
  groupId: string;
}

export async function runMainTUI(state: TUIState): Promise<void> {
  const config = (await storage.getConfig())!;
  const proto = await storage.getPrototype(state.prototypeId);
  if (!proto) {
    p.log.error('Prototype not found.');
    return;
  }

  let currentGroupId = state.groupId;

  while (true) {
    const groups = await storage.listGroups(state.prototypeId);
    const currentGroup = groups.find((g) => g.id === currentGroupId) || groups[0];
    if (!currentGroup) {
      p.log.error('No chapters found.');
      return;
    }
    currentGroupId = currentGroup.id;

    const versions = await storage.listVersions(state.prototypeId, currentGroupId);

    // Build scenario list
    const scenarios = buildScenarios(versions);

    // Build choices
    const choices: { value: string; label: string; hint?: string }[] = [];

    for (const scenario of scenarios) {
      const star = scenario.starred ? chalk.yellow(' \u2605') : '';
      const subCount = scenario.count > 1 ? chalk.dim(` (${scenario.count} takes)`) : '';
      choices.push({
        value: `version:${scenario.latestId}`,
        label: `${scenario.name}${star}${subCount}`,
        hint: scenario.tags.length > 0 ? scenario.tags.join(', ') : undefined,
      });
    }

    choices.push(
      { value: 'action:snap', label: chalk.green('\u2795 New snap'), hint: 'save current state' },
      { value: 'action:group', label: chalk.cyan('\u{1F4C1} Switch chapter'), hint: currentGroup.name },
      { value: 'action:serve', label: chalk.magenta('\u{1F310} Open explorer'), hint: 'localhost:4200' },
      { value: 'action:quit', label: chalk.dim('\u{1F6AA} Quit') },
    );

    const header = `${chalk.bold(proto.name)} ${chalk.dim('\u203A')} ${chalk.cyan(currentGroup.name)}`;
    const versionCount = versions.length === 1 ? '1 round' : `${versions.length} rounds`;

    const selection = await p.select({
      message: `${header} ${chalk.dim(`(${versionCount})`)}`,
      options: choices,
    });

    if (p.isCancel(selection)) {
      p.outro('Bye!');
      return;
    }

    const [type, id] = (selection as string).split(':');

    if (type === 'action') {
      if (id === 'quit') {
        p.outro('Bye!');
        return;
      }

      if (id === 'snap') {
        const snapName = await p.text({
          message: 'Snap name',
          placeholder: 'Untitled',
        });

        if (p.isCancel(snapName)) continue;

        const s = p.spinner();
        s.start('Snapping');

        const version = await createSnapshot(state.prototypeId, {
          name: snapName,
          groupId: currentGroupId,
          category: 'Scenarios',
          tags: [],
          author: config.defaultAuthor,
        });

        s.stop(`Snapshot "${snapName}" saved (${version.fileCount} files)`);
        continue;
      }

      if (id === 'group') {
        const newGroup = await switchGroup(state.prototypeId, groups, currentGroupId);
        if (newGroup) currentGroupId = newGroup;
        continue;
      }

      if (id === 'serve') {
        p.log.info(`Run ${chalk.cyan('snap serve')} in another terminal to open the explorer.`);
        continue;
      }
    }

    if (type === 'version') {
      await versionMenu(state.prototypeId, id, currentGroupId, config.defaultAuthor);
    }
  }
}

async function switchGroup(
  prototypeId: string,
  groups: VersionGroup[],
  currentGroupId: string,
): Promise<string | null> {
  const choices = groups.map((g) => ({
    value: g.id,
    label: g.name,
    hint: g.id === currentGroupId ? 'current' : undefined,
  }));

  choices.push({ value: '__new__', label: chalk.green('+ Create new chapter'), hint: undefined });

  const selected = await p.select({
    message: 'Switch chapter',
    options: choices,
  });

  if (p.isCancel(selected)) return null;

  if (selected === '__new__') {
    const name = await p.text({
      message: 'Chapter name',
      placeholder: 'v2',
    });

    if (p.isCancel(name)) return null;

    const group = await storage.createGroup(prototypeId, { name });
    p.log.success(`Chapter "${name}" created`);
    return group.id;
  }

  return selected as string;
}

async function versionMenu(
  prototypeId: string,
  versionId: string,
  groupId: string,
  defaultAuthor: string,
): Promise<void> {
  const version = await storage.getVersion(versionId);
  if (!version) return;

  // Get all takes
  const allVersions = await storage.listVersions(prototypeId, groupId);
  const subs = allVersions
    .filter((v) => v.name === version.name && v.category === version.category)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const choices: { value: string; label: string; hint?: string }[] = [];

  if (subs.length > 1) {
    choices.push({
      value: 'variations',
      label: `Browse takes (${subs.length})`,
      hint: 'select a specific take',
    });
  }

  choices.push(
    { value: 'restore', label: 'Restore this version', hint: 'overwrite current files' },
    { value: 'snap-on', label: 'Snap as new take', hint: 'add another take' },
    { value: 'back', label: chalk.dim('Back') },
  );

  const action = await p.select({
    message: `${version.name}`,
    options: choices,
  });

  if (p.isCancel(action) || action === 'back') return;

  if (action === 'restore') {
    const confirm = await p.confirm({
      message: 'Restore will overwrite your current files. Continue?',
    });
    if (p.isCancel(confirm) || !confirm) return;

    const s = p.spinner();
    s.start('Restoring');
    await restoreVersion(versionId);
    s.stop(`Restored "${version.name}"`);
    return;
  }

  if (action === 'snap-on') {
    const s = p.spinner();
    s.start('Snapping');
    const v = await createSnapshot(prototypeId, {
      name: version.name,
      groupId,
      category: version.category,
      tags: [],
      author: defaultAuthor,
    });
    s.stop(`New take of "${version.name}" saved (${v.fileCount} files)`);
    return;
  }

  if (action === 'variations') {
    const subChoices = subs.map((s, i) => ({
      value: s.id,
      label: `${String(i + 1).padStart(2, '0')} - ${new Date(s.timestamp).toLocaleDateString()}`,
      hint: s.id === versionId ? 'current' : undefined,
    }));

    const selected = await p.select({
      message: `Takes of "${version.name}"`,
      options: subChoices,
    });

    if (p.isCancel(selected)) return;

    const confirm = await p.confirm({
      message: 'Restore this take?',
    });
    if (p.isCancel(confirm) || !confirm) return;

    const s = p.spinner();
    s.start('Restoring');
    await restoreVersion(selected as string);
    s.stop('Restored');
  }
}

interface ScenarioInfo {
  name: string;
  count: number;
  latestId: string;
  starred: boolean;
  tags: string[];
}

function buildScenarios(versions: PrototypeVersion[]): ScenarioInfo[] {
  const map = new Map<string, PrototypeVersion[]>();

  for (const v of versions) {
    const key = `${v.category}::${v.name}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(v);
  }

  const scenarios: ScenarioInfo[] = [];
  for (const [, versionList] of map) {
    const sorted = versionList.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const latest = sorted[0];
    scenarios.push({
      name: latest.name,
      count: versionList.length,
      latestId: latest.id,
      starred: latest.starred,
      tags: latest.tags,
    });
  }

  return scenarios;
}
