import { create } from 'zustand';
import { api } from '@/lib/api';

interface Prototype {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface VersionGroup {
  id: string;
  prototypeId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface PrototypeVersion {
  id: string;
  prototypeId: string;
  groupId: string;
  category: string;
  name: string;
  description?: string;
  tags: string[];
  starred: boolean;
  notes?: string;
  author: string;
  timestamp: string;
  fileCount: number;
}

interface ScenarioEntry {
  name: string;
  category: string;
  versions: PrototypeVersion[];
  activeVersion: PrototypeVersion;
  activeSubIndex: number;
}

export interface GroupListItem {
  group: VersionGroup;
  prototypeId: string;
  versionCount: number;
}

export type DrawerView = 'groups' | 'scenarios' | 'settings';

interface ExplorerStore {
  prototypes: Prototype[];
  groupList: GroupListItem[];
  currentPrototype: Prototype | null;

  groups: VersionGroup[];
  currentGroup: VersionGroup | null;
  drawerView: DrawerView;

  allVersions: PrototypeVersion[];
  activeVersionId: string | null;
  subVersionIndices: Record<string, number>;
  pillVisible: boolean;
  drawerOpen: boolean;
  closeOnLeave: boolean;
  pendingGroupId: string | null;

  fetchPrototypes: () => Promise<void>;
  loadPrototype: (id: string) => Promise<void>;
  createPrototype: (name: string, description?: string) => Promise<Prototype>;
  deletePrototype: (id: string) => Promise<void>;

  setCurrentGroup: (group: VersionGroup | null) => void;
  setDrawerView: (view: DrawerView) => void;
  selectVersion: (versionId: string) => void;
  goSubNext: (scenarioName: string) => void;
  goSubPrev: (scenarioName: string) => void;
  goToSubIndex: (scenarioName: string, index: number) => void;

  togglePill: () => void;
  showPill: () => void;
  hidePill: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  currentVersion: () => PrototypeVersion | null;
  groupVersions: () => PrototypeVersion[];
  scenarioEntries: () => Map<string, ScenarioEntry[]>;
  subVersionsOf: (scenarioName: string) => PrototypeVersion[];
  latestVersion: () => PrototypeVersion | null;
  versionCountForGroup: (groupId: string) => number;
}

function scenarioKey(v: PrototypeVersion) {
  return `${v.category}::${v.name}`;
}

export const useExplorerStore = create<ExplorerStore>((set, get) => ({
  prototypes: [],
  groupList: [],
  currentPrototype: null,

  groups: [],
  currentGroup: null,
  drawerView: 'scenarios',

  allVersions: [],
  activeVersionId: null,
  subVersionIndices: {},
  pillVisible: true,
  drawerOpen: false,
  closeOnLeave: false,
  pendingGroupId: null,

  fetchPrototypes: async () => {
    const protos = await api.prototypes.list();
    const allItems: GroupListItem[] = [];

    await Promise.all(
      protos.map(async (p) => {
        const [groups, versions] = await Promise.all([
          api.groups.list(p.id),
          api.versions.list(p.id),
        ]);
        for (const g of groups) {
          allItems.push({
            group: g,
            prototypeId: p.id,
            versionCount: versions.filter((v: any) => v.groupId === g.id).length,
          });
        }
      }),
    );

    set({ prototypes: protos, groupList: allItems });
  },

  loadPrototype: async (id) => {
    const [proto, groups, allVersions] = await Promise.all([
      api.prototypes.get(id),
      api.groups.list(id),
      api.versions.list(id),
    ]);

    const pending = get().pendingGroupId;
    const targetGroup = (pending && groups.find((g) => g.id === pending)) || groups[0] || null;

    const gVersions = targetGroup
      ? allVersions.filter((v: any) => v.groupId === targetGroup.id)
      : allVersions;
    const firstVersionId = gVersions[0]?.id || null;

    const updatedGroupList = get().groupList.map((item) =>
      item.group.prototypeId === id
        ? { ...item, versionCount: allVersions.filter((v: any) => v.groupId === item.group.id).length }
        : item,
    );

    set({
      currentPrototype: proto,
      groups,
      currentGroup: targetGroup,
      allVersions,
      activeVersionId: firstVersionId,
      subVersionIndices: {},
      drawerView: 'scenarios',
      pendingGroupId: null,
      groupList: updatedGroupList,
      drawerOpen: get().drawerOpen,
    });
  },

  createPrototype: async (name, description) => {
    const proto = await api.prototypes.create({ name, description });
    set({ prototypes: [proto, ...get().prototypes] });
    return proto;
  },

  deletePrototype: async (id) => {
    await api.prototypes.delete(id);
    set({ prototypes: get().prototypes.filter((p) => p.id !== id) });
  },

  setCurrentGroup: (group) => {
    const gVersions = group
      ? get().allVersions.filter((v) => v.groupId === group.id)
      : [];
    const firstId = gVersions[0]?.id || null;
    set({
      currentGroup: group,
      drawerView: 'scenarios',
      activeVersionId: firstId,
      subVersionIndices: {},
    });
  },

  setDrawerView: (view) => set({ drawerView: view }),

  selectVersion: (versionId) => {
    const v = get().allVersions.find((ver) => ver.id === versionId);
    if (!v) return;

    const currentGroup = get().currentGroup;
    if (currentGroup && v.groupId !== currentGroup.id) {
      const newGroup = get().groups.find((g) => g.id === v.groupId);
      if (newGroup) set({ currentGroup: newGroup });
    }

    const subs = get().allVersions
      .filter((s) => s.name === v.name && s.groupId === v.groupId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const idx = subs.findIndex((s) => s.id === versionId);
    set({
      activeVersionId: versionId,
      subVersionIndices: { ...get().subVersionIndices, [scenarioKey(v)]: idx >= 0 ? idx : 0 },
    });
  },

  goSubNext: (scenarioName) => {
    const current = get().currentVersion();
    if (!current) return;
    const key = `${current.category}::${scenarioName}`;
    const subs = get().groupVersions()
      .filter((v) => v.name === scenarioName)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const idx = get().subVersionIndices[key] ?? 0;
    if (idx + 1 < subs.length) {
      set({
        activeVersionId: subs[idx + 1].id,
        subVersionIndices: { ...get().subVersionIndices, [key]: idx + 1 },
      });
    }
  },

  goSubPrev: (scenarioName) => {
    const current = get().currentVersion();
    if (!current) return;
    const key = `${current.category}::${scenarioName}`;
    const subs = get().groupVersions()
      .filter((v) => v.name === scenarioName)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const idx = get().subVersionIndices[key] ?? 0;
    if (idx > 0) {
      set({
        activeVersionId: subs[idx - 1].id,
        subVersionIndices: { ...get().subVersionIndices, [key]: idx - 1 },
      });
    }
  },

  goToSubIndex: (scenarioName, index) => {
    const current = get().currentVersion();
    if (!current) return;
    const key = `${current.category}::${scenarioName}`;
    const subs = get().groupVersions()
      .filter((v) => v.name === scenarioName)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    if (index >= 0 && index < subs.length) {
      set({
        activeVersionId: subs[index].id,
        subVersionIndices: { ...get().subVersionIndices, [key]: index },
      });
    }
  },

  togglePill: () => set((s) => ({ pillVisible: !s.pillVisible })),
  showPill: () => set({ pillVisible: true }),
  hidePill: () => set({ pillVisible: false }),
  openDrawer: () => set({ drawerOpen: true, drawerView: 'scenarios', closeOnLeave: false }),
  closeDrawer: () => set({ drawerOpen: false, closeOnLeave: false }),
  toggleDrawer: () => set((s) => s.drawerOpen ? { drawerOpen: false, closeOnLeave: false } : { drawerOpen: true, drawerView: 'scenarios', closeOnLeave: false }),

  currentVersion: () => {
    const { allVersions, activeVersionId, currentGroup } = get();
    if (activeVersionId) {
      const v = allVersions.find((v) => v.id === activeVersionId);
      if (v) return v;
    }
    const gVersions = currentGroup
      ? allVersions.filter((v) => v.groupId === currentGroup.id)
      : allVersions;
    return gVersions[0] || null;
  },

  groupVersions: () => {
    const { allVersions, currentGroup } = get();
    if (!currentGroup) return allVersions;
    return allVersions.filter((v) => v.groupId === currentGroup.id);
  },

  scenarioEntries: () => {
    const gVersions = get().groupVersions();
    const byCategory = new Map<string, Map<string, PrototypeVersion[]>>();

    for (const v of gVersions) {
      const cat = v.category || 'Uncategorized';
      if (!byCategory.has(cat)) byCategory.set(cat, new Map());
      const catMap = byCategory.get(cat)!;
      if (!catMap.has(v.name)) catMap.set(v.name, []);
      catMap.get(v.name)!.push(v);
    }

    const result = new Map<string, ScenarioEntry[]>();
    const indices = get().subVersionIndices;

    for (const [cat, nameMap] of byCategory) {
      const entries: ScenarioEntry[] = [];
      for (const [name, versions] of nameMap) {
        const sorted = versions.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        const key = `${cat}::${name}`;
        const idx = indices[key] ?? 0;
        const clampedIdx = Math.min(idx, sorted.length - 1);
        entries.push({
          name,
          category: cat,
          versions: sorted,
          activeVersion: sorted[clampedIdx],
          activeSubIndex: clampedIdx,
        });
      }
      result.set(cat, entries);
    }

    return result;
  },

  subVersionsOf: (scenarioName) => {
    return get().groupVersions()
      .filter((v) => v.name === scenarioName)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  },

  latestVersion: () => {
    const versions = get().groupVersions();
    if (versions.length === 0) return null;
    return versions.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
  },

  versionCountForGroup: (groupId: string) => {
    return get().allVersions.filter((v) => v.groupId === groupId).length;
  },
}));
