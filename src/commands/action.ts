import { Command } from 'commander';
import chalk from 'chalk';
import { storage } from '../core/storage.js';
import { ensureInit } from '../core/ensure-init.js';
import type { PrototypeVersion, VersionGroup } from '../core/types.js';

export const actionCommand = new Command('action')
  .description('Show project overview and available actions')
  .action(async () => {
    const { prototypeId } = await ensureInit();

    const config = (await storage.getConfig())!;
    const proto = await storage.getPrototype(prototypeId);
    if (!proto) return;

    const groups = await storage.listGroups(prototypeId);
    const allVersions = await storage.listVersions(prototypeId);

    // Find the most recent version across all groups
    const latestVersion = allVersions.length > 0
      ? allVersions.reduce((a, b) => (a.timestamp > b.timestamp ? a : b))
      : null;

    const d = chalk.dim;
    const c = chalk.cyan;
    const w = chalk.white;

    // Project header
    console.log(`\n\u{1F4E6} ${w(proto.name)}`);

    // Build numbered tree
    let roundCounter = 0;

    for (let gi = 0; gi < groups.length; gi++) {
      const group = groups[gi];
      const gVersions = allVersions.filter((v) => v.groupId === group.id);
      const scenarios = buildScenarios(gVersions);
      const chapterNum = String(gi + 1).padStart(2, '0');

      console.log(`${d('[')}${w(chapterNum)}${d(']')} \u{1F4D6} ${c(group.name)}`);

      for (let si = 0; si < scenarios.length; si++) {
        const scenario = scenarios[si];
        const isLast = si === scenarios.length - 1;
        const branch = isLast ? '\u2514\u2500' : '\u251C\u2500';
        const roundNum = `${gi + 1}.${si + 1}`;
        const takeLabel = scenario.count === 1
          ? d('(1 take)')
          : d(`(${scenario.count} takes)`);

        // Check if this is the active round
        let marker = '';
        if (latestVersion && scenario.versions.some((v) => v.id === latestVersion.id)) {
          const takeIdx = scenario.versions.findIndex((v) => v.id === latestVersion.id) + 1;
          marker = ` ${d('\u2190')} ${chalk.green(`you are here, working on take ${takeIdx}`)}`;
        }

        const star = scenario.starred ? chalk.yellow(' \u2605') : '';

        console.log(` ${d(branch)} ${w(roundNum)} ${scenario.name}${star} ${takeLabel}${marker}`);
        roundCounter++;
      }

      if (scenarios.length === 0) {
        console.log(` ${d('\u2514\u2500')} ${d('(empty)')}`);
      }
    }

    if (groups.length === 0) {
      console.log(d(' (no chapters yet)'));
    }

    // Actions
    console.log(`\nAsk me anything about this project.\n`);
    console.log(`What would you like to do next?`);
    console.log(` 1. ${w('SNAP')} current files (new round or take)`);
    console.log(` 2. ${w('START')} a new chapter`);
    console.log(` 3. ${w('SWITCH')} to a different snap to build from`);
    console.log(` 4. ${w('OPEN')} visual explorer`);
    console.log(` 5. ${w('MORE')} things you can do`);
    console.log('');
  });

interface ScenarioInfo {
  name: string;
  count: number;
  starred: boolean;
  versions: PrototypeVersion[];
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
    const sorted = versionList.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    scenarios.push({
      name: sorted[0].name,
      count: versionList.length,
      starred: sorted.some((v) => v.starred),
      versions: sorted,
    });
  }

  return scenarios;
}
