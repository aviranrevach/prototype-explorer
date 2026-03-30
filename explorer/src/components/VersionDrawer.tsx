import { useState, useRef } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Terminal,
  HelpCircle,
  Settings,
  Sun,
  Moon,
  Hash,
  ChevronsLeftRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExplorerStore, type GroupListItem } from '@/stores/explorerStore';
import { usePreferencesStore, type Theme, type MenuPosition, type SubNavStyle } from '@/stores/preferencesStore';
import { cn } from '@/lib/utils';
import { HowToModal } from './HowToModal';

interface VersionDrawerProps {
  onClose: () => void;
}

const positions: { value: MenuPosition; label: string; row: number; col: number }[] = [
  { value: 'top-left', label: 'Top Left', row: 0, col: 0 },
  { value: 'top-right', label: 'Top Right', row: 0, col: 1 },
  { value: 'bottom-left', label: 'Bottom Left', row: 1, col: 0 },
  { value: 'bottom-right', label: 'Bottom Right', row: 1, col: 1 },
];

export function VersionDrawer({ onClose }: VersionDrawerProps) {
  const navigate = useNavigate();
  const {
    groupList,
    currentPrototype,
    currentGroup,
    currentVersion,
    drawerView,
    setDrawerView,
    setCurrentGroup,
    scenarioEntries,
    latestVersion,
    groupVersions,
    selectVersion,
    goSubNext,
    goSubPrev,
  } = useExplorerStore();

  const { theme, menuPosition, subNavStyle, setTheme, setMenuPosition, setSubNavStyle } = usePreferencesStore();

  const current = currentVersion();
  const latest = latestVersion();
  const gVersions = groupVersions();
  const entries = scenarioEntries();

  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});
  const [howToOpen, setHowToOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  function toggleCat(cat: string) {
    setCollapsedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  function handlePickScenario(entry: { activeVersion: { id: string } }) {
    selectVersion(entry.activeVersion.id);
    useExplorerStore.setState({ closeOnLeave: true });
  }

  function handlePickGroupItem(item: GroupListItem) {
    if (item.prototypeId === currentPrototype?.id) {
      setCurrentGroup(item.group);
    } else {
      useExplorerStore.setState({ pendingGroupId: item.group.id });
      navigate(`/viewer/${item.prototypeId}`);
    }
  }

  const isList = drawerView === 'groups';
  const isDetail = drawerView === 'scenarios';
  const isSettings = drawerView === 'settings';

  return (
    <div className="flex flex-col">
      {(isDetail || isSettings) && (
        <button
          type="button"
          onClick={() => setDrawerView('groups')}
          className="mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-glass-border bg-glass text-muted-foreground shadow-lg backdrop-blur-2xl transition-colors hover:bg-glass-active hover:text-foreground"
          aria-label="Back to list"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      )}

      <div className="flex w-[min(100vw-2rem,22rem)] max-h-[min(80vh,34rem)] flex-col rounded-2xl border border-glass-border bg-glass shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl animate-slide-up overflow-hidden">

        {/* ────── DETAIL: Rounds for current chapter ────── */}
        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{ gridTemplateRows: isDetail ? '1fr' : '0fr' }}
        >
          <div className="min-h-0 overflow-hidden">
            {currentGroup && (
              <button
                type="button"
                onClick={() => setDrawerView('groups')}
                className="flex w-full cursor-pointer items-start gap-2 px-4 pt-4 pb-3 text-left transition-colors hover:bg-glass-hover"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-bold leading-snug text-foreground">
                    {currentGroup.name}
                  </h3>
                  {currentGroup.description && (
                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                      {currentGroup.description}
                    </p>
                  )}
                </div>
                <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            )}

            <div ref={contentRef} className="overflow-y-auto px-3 pb-3" style={{ maxHeight: 'min(55vh, 22rem)' }}>
              {[...entries.entries()].map(([cat, scenarioList]) => {
                const isCollapsed = collapsedCats[cat] ?? false;
                return (
                  <div
                    key={cat}
                    className="mb-2 rounded-xl border border-glass-divide bg-glass-subtle"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCat(cat)}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
                    >
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
                          isCollapsed && '-rotate-90',
                        )}
                      />
                      <span className="flex-1 text-[13px] font-semibold text-foreground">
                        {cat}
                      </span>
                      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-primary">
                        {scenarioList.length}
                      </span>
                    </button>

                    <div
                      className="grid transition-all duration-200 ease-in-out"
                      style={{ gridTemplateRows: isCollapsed ? '0fr' : '1fr' }}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="space-y-0.5 px-1.5 pb-2">
                          {scenarioList.map((entry) => {
                            const isActive = current?.id === entry.activeVersion.id;
                            const isLatest = latest?.id === entry.activeVersion.id ||
                              entry.versions.some((v) => v.id === latest?.id);
                            const subCount = entry.versions.length;
                            const subIdx = entry.activeSubIndex + 1;
                            const showSubNav = subCount > 1;

                            return (
                              <button
                                key={entry.name}
                                type="button"
                                onClick={() => handlePickScenario(entry)}
                                className={cn(
                                  'group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all duration-150',
                                  isActive
                                    ? 'bg-primary/12 text-foreground'
                                    : 'text-muted-foreground hover:bg-glass-hover hover:text-foreground',
                                )}
                              >
                                <span
                                  className={cn(
                                    'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                                    isActive
                                      ? 'bg-primary shadow-[0_0_6px_rgba(109,92,255,0.5)]'
                                      : 'bg-inactive group-hover:bg-muted-foreground',
                                  )}
                                />
                                <span className="truncate text-[13px] font-medium">
                                  {entry.name}
                                </span>

                                {isLatest && (
                                  <span className={cn(
                                    'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                                    isActive
                                      ? 'bg-primary/15 text-primary'
                                      : 'bg-glass-active text-muted-foreground',
                                  )}>
                                    Latest
                                  </span>
                                )}

                                {isActive && showSubNav && (
                                  <div className="flex shrink-0 items-center gap-0.5">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); goSubPrev(entry.name); }}
                                      disabled={subIdx <= 1}
                                      className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-glass-active hover:text-foreground disabled:opacity-30"
                                    >
                                      <ChevronLeft className="h-3 w-3" />
                                    </button>
                                    <span className="min-w-[2rem] text-center text-[10px] font-medium tabular-nums text-muted-foreground">
                                      {subIdx}/{subCount}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); goSubNext(entry.name); }}
                                      disabled={subIdx >= subCount}
                                      className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-glass-active hover:text-foreground disabled:opacity-30"
                                    >
                                      <ChevronRight className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}

                                {!isActive && showSubNav && (
                                  <span className="shrink-0 rounded-md bg-glass-hover px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-dim">
                                    {subCount}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {gVersions.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8">
                  <Terminal className="h-5 w-5 text-dim" />
                  <p className="text-[13px] text-muted-foreground">No versions yet</p>
                  <code className="rounded-md bg-glass-hover px-2 py-1 text-[11px] text-muted-foreground">
                    snap "Name"
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ────── LIST: All chapters ────── */}
        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{ gridTemplateRows: isList ? '1fr' : '0fr' }}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Project's Prototypes
              </h2>
              <button
                type="button"
                onClick={() => setDrawerView('settings')}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-glass-active hover:text-foreground"
                aria-label="Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="py-1">
              <div className="divide-y divide-glass-divide">
                {groupList.map((item) => {
                  const isActive = currentGroup?.id === item.group.id && currentPrototype?.id === item.prototypeId;
                  return (
                    <button
                      key={item.group.id}
                      type="button"
                      onClick={() => handlePickGroupItem(item)}
                      className={cn(
                        'group flex w-full items-start gap-3 px-4 py-3 text-left transition-all duration-150',
                        isActive
                          ? 'bg-glass-hover'
                          : 'hover:bg-glass-hover',
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          'text-[14px] font-semibold leading-snug',
                          isActive ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground',
                        )}>
                          {item.group.name}
                        </p>
                        {item.group.description && (
                          <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                            {item.group.description}
                          </p>
                        )}
                      </div>
                      <span className={cn(
                        'mt-0.5 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums',
                        isActive
                          ? 'bg-primary/15 text-primary'
                          : 'bg-glass-active text-muted-foreground',
                      )}>
                        {item.versionCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-glass-divide px-3 py-2">
              <button
                type="button"
                onClick={() => setHowToOpen(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-glass-hover hover:text-foreground"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                How to
              </button>
            </div>
          </div>
        </div>

        {/* ────── SETTINGS: Inline settings view ────── */}
        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{ gridTemplateRows: isSettings ? '1fr' : '0fr' }}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Settings
              </h2>
            </div>

            <div className="space-y-5 px-4 pb-4">
              {/* Theme */}
              <div>
                <p className="mb-2 text-[12px] font-medium text-muted-foreground">Theme</p>
                <div className="flex gap-2">
                  {([
                    { value: 'dark' as Theme, icon: Moon, label: 'Dark' },
                    { value: 'light' as Theme, icon: Sun, label: 'Light' },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTheme(opt.value)}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-[13px] font-semibold transition-all duration-150',
                        theme === opt.value
                          ? 'border-primary/40 bg-primary/10 text-foreground'
                          : 'border-glass-divide bg-glass-subtle text-muted-foreground hover:bg-glass-hover hover:text-foreground',
                      )}
                    >
                      <opt.icon className="h-4 w-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Position */}
              <div>
                <p className="mb-2 text-[12px] font-medium text-muted-foreground">Menu Position</p>
                <div className="grid grid-cols-2 gap-2">
                  {positions.map((pos) => (
                    <button
                      key={pos.value}
                      type="button"
                      onClick={() => setMenuPosition(pos.value)}
                      className={cn(
                        'group flex flex-col items-center gap-1.5 rounded-xl border py-2.5 transition-all duration-150',
                        menuPosition === pos.value
                          ? 'border-primary/40 bg-primary/10'
                          : 'border-glass-divide bg-glass-subtle hover:bg-glass-hover',
                      )}
                    >
                      <div className="relative h-8 w-12 rounded border border-glass-border bg-glass-subtle">
                        <div
                          className={cn(
                            'absolute h-1.5 w-3 rounded-sm transition-colors',
                            menuPosition === pos.value ? 'bg-primary' : 'bg-inactive group-hover:bg-muted-foreground',
                            pos.row === 0 && 'top-1',
                            pos.row === 1 && 'bottom-1',
                            pos.col === 0 && 'left-1',
                            pos.col === 1 && 'right-1',
                          )}
                        />
                      </div>
                      <span className={cn(
                        'text-[10px] font-medium',
                        menuPosition === pos.value ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground',
                      )}>
                        {pos.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Take Navigation */}
              <div>
                <p className="mb-2 text-[12px] font-medium text-muted-foreground">Take Navigation</p>
                <div className="flex gap-2">
                  {([
                    { value: 'numbered' as SubNavStyle, icon: Hash, label: 'Numbered' },
                    { value: 'chevron' as SubNavStyle, icon: ChevronsLeftRight, label: 'Arrows' },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSubNavStyle(opt.value)}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-[13px] font-semibold transition-all duration-150',
                        subNavStyle === opt.value
                          ? 'border-primary/40 bg-primary/10 text-foreground'
                          : 'border-glass-divide bg-glass-subtle text-muted-foreground hover:bg-glass-hover hover:text-foreground',
                      )}
                    >
                      <opt.icon className="h-4 w-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {howToOpen && <HowToModal onClose={() => setHowToOpen(false)} />}
    </div>
  );
}
