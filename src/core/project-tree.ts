import chalk from 'chalk';
import { storage } from './storage.js';
import type { PrototypeVersion } from './types.js';

export interface ScenarioInfo {
  name: string;
  count: number;
  starred: boolean;
  tags: string[];
  versions: PrototypeVersion[];
  roundNum: string;
  latestId: string;
}

export interface ChapterInfo {
  chapterNum: string;
  group: { id: string; name: string; description?: string };
  scenarios: ScenarioInfo[];
}

export interface ProjectTree {
  protoName: string;
  chapters: ChapterInfo[];
  activeVersionId: string | null;
}

export async function buildProjectTree(prototypeId: string): Promise<ProjectTree> {
  const proto = await storage.getPrototype(prototypeId);
  const groups = await storage.listGroups(prototypeId);
  const allVersions = await storage.listVersions(prototypeId);

  const latestVersion = allVersions.length > 0
    ? allVersions.reduce((a, b) => (a.timestamp > b.timestamp ? a : b))
    : null;

  const chapters: ChapterInfo[] = [];

  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi];
    const gVersions = allVersions.filter((v) => v.groupId === group.id);
    const chapterNum = String(gi + 1).padStart(2, '0');

    const scenarioMap = new Map<string, PrototypeVersion[]>();
    for (const v of gVersions) {
      const key = `${v.category}::${v.name}`;
      if (!scenarioMap.has(key)) scenarioMap.set(key, []);
      scenarioMap.get(key)!.push(v);
    }

    const scenarios: ScenarioInfo[] = [];
    let si = 0;
    for (const [, versionList] of scenarioMap) {
      const sorted = versionList.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      scenarios.push({
        name: sorted[0].name,
        count: versionList.length,
        starred: sorted.some((v) => v.starred),
        tags: [...new Set(sorted.flatMap((v) => v.tags))],
        versions: sorted,
        roundNum: `${gi + 1}.${si + 1}`,
        latestId: sorted[sorted.length - 1].id,
      });
      si++;
    }

    chapters.push({ chapterNum, group, scenarios });
  }

  return {
    protoName: proto?.name || 'Untitled',
    chapters,
    activeVersionId: latestVersion?.id || null,
  };
}

export function printProjectTree(tree: ProjectTree): void {
  const d = chalk.dim;
  const c = chalk.cyan;
  const w = chalk.white;

  console.log(`\u{1F4E6} ${w(tree.protoName)}`);

  for (const chapter of tree.chapters) {
    console.log(`${d('[')}${w(chapter.chapterNum)}${d(']')} \u{1F4D6} ${c(chapter.group.name)}`);

    for (let si = 0; si < chapter.scenarios.length; si++) {
      const scenario = chapter.scenarios[si];
      const isLast = si === chapter.scenarios.length - 1;
      const branch = isLast ? '\u2514\u2500' : '\u251C\u2500';
      const takeLabel = scenario.count === 1
        ? d('(1 take)')
        : d(`(${scenario.count} takes)`);

      let marker = '';
      if (tree.activeVersionId && scenario.versions.some((v) => v.id === tree.activeVersionId)) {
        const takeIdx = scenario.versions.findIndex((v) => v.id === tree.activeVersionId) + 1;
        marker = ` ${d('\u2190')} ${chalk.green(`you are here, working on take ${takeIdx}`)}`;
      }

      const star = scenario.starred ? chalk.yellow(' \u2605') : '';

      console.log(` ${d(branch)} ${w(scenario.roundNum)} ${scenario.name}${star} ${takeLabel}${marker}`);
    }

    if (chapter.scenarios.length === 0) {
      console.log(` ${d('\u2514\u2500')} ${d('(empty)')}`);
    }
  }

  if (tree.chapters.length === 0) {
    console.log(d(' (no chapters yet)'));
  }
}
