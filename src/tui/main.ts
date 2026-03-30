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
    const scenarios = buildScenarios(versions);

    const choices: { value: string; label: string; hint?: string }[] = [];

    if (scenarios.length === 0) {
      choices.push({
        value: 'action:snap',
        label: chalk.green('\u2795 Take your first snap'),
        hint: 'save your current files',
      });
    } else {
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
        { value: 'action:snap', label: chalk.green('\u2795 New snap'), hint: 'save current files' },
      );
    }

    choices.push(
      { value: 'action:group', label: chalk.cyan('\u{1F4C1} Switch chapter'), hint: `viewing: ${currentGroup.name}` },
      { value: 'action:serve', label: chalk.magenta('\u{1F310} Open explorer'), hint: 'visual browser' },
      { value: 'action:help', label: chalk.yellow('\u2753 What is this?'), hint: undefined },
      { value: 'action:quit', label: chalk.dim('\u{1F6AA} Quit') },
    );

    const header = `${chalk.bold(proto.name)} ${chalk.dim('\u203A')} ${chalk.cyan(currentGroup.name)}`;
    const versionCount = versions.length === 0
      ? 'empty'
      : versions.length === 1 ? '1 round' : `${versions.length} rounds`;

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
          validate: (val) => {
            if (!val?.trim()) return 'Name cannot be empty';
          },
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

      if (id === 'help') {
        showHelp();
        continue;
      }

      if (id === 'serve') {
        const s = p.spinner();
        s.start('Starting explorer');
        try {
          const { createServer } = await import('../server/index.js');
          const open = (await import('open')).default;
          const app = await createServer();
          const port = 4200;
          await new Promise<void>((resolve, reject) => {
            const server = app.listen(port, () => {
              s.stop(`Explorer running at ${chalk.cyan(`http://localhost:${port}`)}`);
              open(`http://localhost:${port}`);
              resolve();
            });
            server.on('error', (err: NodeJS.ErrnoException) => {
              if (err.code === 'EADDRINUSE') {
                s.stop(`Port ${port} already in use, opening browser anyway`);
                open(`http://localhost:${port}`);
                resolve();
              } else {
                reject(err);
              }
            });
          });
        } catch {
          s.stop(chalk.red('Failed to start explorer'));
        }
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
      validate: (val) => {
        if (!val.trim()) return 'Name cannot be empty';
      },
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
      value: 'takes',
      label: `Browse takes (${subs.length})`,
      hint: 'view all takes of this round',
    });
  }

  choices.push(
    { value: 'restore', label: 'Restore this round', hint: 'replace your current files with this snap' },
    { value: 'snap-on', label: 'Snap as new take', hint: 'save your current files as another take of this round' },
    { value: 'back', label: chalk.dim('Back') },
  );

  const action = await p.select({
    message: `${version.name}${subs.length > 1 ? chalk.dim(` - take ${subs.findIndex((s) => s.id === versionId) + 1}/${subs.length}`) : ''}`,
    options: choices,
  });

  if (p.isCancel(action) || action === 'back') return;

  if (action === 'restore') {
    const confirm = await p.confirm({
      message: 'This will overwrite your current files. Continue?',
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

  if (action === 'takes') {
    const currentIdx = subs.findIndex((s) => s.id === versionId);
    const subChoices = subs.map((s, i) => ({
      value: s.id,
      label: `Take ${String(i + 1).padStart(2, '0')} - ${new Date(s.timestamp).toLocaleDateString()}`,
      hint: i === currentIdx ? 'current' : undefined,
    }));

    subChoices.push({ value: '__back__', label: chalk.dim('Back'), hint: undefined });

    const selected = await p.select({
      message: `Takes of "${version.name}"`,
      options: subChoices,
    });

    if (p.isCancel(selected) || selected === '__back__') return;

    const selectedIdx = subs.findIndex((s) => s.id === selected);
    const selectedTake = subs[selectedIdx];

    const takeAction = await p.select({
      message: `Take ${String(selectedIdx + 1).padStart(2, '0')} - ${new Date(selectedTake.timestamp).toLocaleDateString()}`,
      options: [
        { value: 'restore', label: 'Restore this take', hint: 'replace your current files' },
        { value: 'back', label: chalk.dim('Back') },
      ],
    });

    if (p.isCancel(takeAction) || takeAction === 'back') return;

    const confirm = await p.confirm({
      message: 'This will overwrite your current files. Continue?',
    });
    if (p.isCancel(confirm) || !confirm) return;

    const s = p.spinner();
    s.start('Restoring');
    await restoreVersion(selected as string);
    s.stop(`Restored "${version.name}" (take ${String(selectedIdx + 1).padStart(2, '0')})`);
  }
}

function showHelp() {
  const d = chalk.dim;
  const c = chalk.cyan;
  const w = chalk.white;
  const g = chalk.green;

  p.log.message(`
${w('How designers use Snap:')}

  ${c('\u{1F4E6}')} Task Management App                    ${d('prototype')}
  ${d('\u2502')}
  ${d('\u251C\u2500\u2500')} ${c('\u{1F4D6}')} V1 Dashboard New Version           ${d('chapter')}
  ${d('\u2502')}   ${d('\u251C\u2500\u2500')} Notification Center               ${d('round')}
  ${d('\u2502')}   ${d('\u2502')}   ${d('\u251C\u2500\u2500')} take 1 ${d('- badge count on bell')}
  ${d('\u2502')}   ${d('\u2502')}   ${d('\u251C\u2500\u2500')} take 2 ${d('- badge + preview text')}
  ${d('\u2502')}   ${d('\u2502')}   ${d('\u2514\u2500\u2500')} take 3 ${d('- red dot, no count')}    ${g('\u2190 flip between these')}
  ${d('\u2502')}   ${d('\u251C\u2500\u2500')} Activity Feed
  ${d('\u2502')}   ${d('\u2514\u2500\u2500')} Team Settings
  ${d('\u2502')}
  ${d('\u2514\u2500\u2500')} ${c('\u{1F4D6}')} V2 Dark Theme                      ${d('another chapter')}
      ${d('\u2514\u2500\u2500')} Notification Center ${d('(2 takes)')}

  ${w('A round')} is a screen or component you're designing.
  ${w('A take')} is a slight variation of the same design.
  Snap the same name again to add another take.
`);
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
