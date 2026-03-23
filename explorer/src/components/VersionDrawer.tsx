import { useState, useRef } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExplorerStore, type GroupListItem } from '@/stores/explorerStore';
import { cn } from '@/lib/utils';

interface VersionDrawerProps {
  onClose: () => void;
}

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

  const current = currentVersion();
  const latest = latestVersion();
  const gVersions = groupVersions();
  const entries = scenarioEntries();

  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  function toggleCat(cat: string) {
    setCollapsedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  function handlePickScenario(entry: { activeVersion: { id: string } }) {
    selectVersion(entry.activeVersion.id);
    onClose();
  }

  function handlePickGroupItem(item: GroupListItem) {
    if (item.prototypeId === currentPrototype?.id) {
      setCurrentGroup(item.group);
    } else {
      useExplorerStore.setState({ pendingGroupId: item.group.id });
      navigate(`/viewer/${item.prototypeId}`);
      onClose();
    }
  }

  const isList = drawerView === 'groups';
  const isDetail = drawerView === 'scenarios';

  return (
    <div className="flex flex-col">
      {isDetail && (
        <button
          type="button"
          onClick={() => setDrawerView('groups')}
          className="mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-zinc-900/[0.97] text-zinc-400 shadow-lg backdrop-blur-2xl transition-colors hover:bg-white/[0.06] hover:text-white"
          aria-label="Back to list"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      )}

      <div className="flex w-[min(100vw-2rem,22rem)] max-h-[min(80vh,34rem)] flex-col rounded-2xl border border-white/[0.08] bg-zinc-900/[0.97] shadow-[0_24px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-2xl animate-slide-up overflow-hidden">

        {/* ────── DETAIL: Scenarios for current group ────── */}
        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{ gridTemplateRows: isDetail ? '1fr' : '0fr' }}
        >
          <div className="min-h-0 overflow-hidden">
            {currentGroup && (
              <button
                type="button"
                onClick={() => setDrawerView('groups')}
                className="flex w-full cursor-pointer items-start gap-2 px-4 pt-4 pb-3 text-left transition-colors hover:bg-white/[0.02]"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-bold leading-snug text-white">
                    {currentGroup.name}
                  </h3>
                  {currentGroup.description && (
                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-zinc-400">
                      {currentGroup.description}
                    </p>
                  )}
                </div>
                <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-zinc-500" />
              </button>
            )}

            <div ref={contentRef} className="overflow-y-auto px-3 pb-3" style={{ maxHeight: 'min(55vh, 22rem)' }}>
              {[...entries.entries()].map(([cat, scenarioList]) => {
                const isCollapsed = collapsedCats[cat] ?? false;
                return (
                  <div
                    key={cat}
                    className="mb-2 rounded-xl border border-white/[0.06] bg-white/[0.015]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCat(cat)}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
                    >
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform duration-200',
                          isCollapsed && '-rotate-90',
                        )}
                      />
                      <span className="flex-1 text-[13px] font-semibold text-zinc-200">
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
                                    ? 'bg-primary/12 text-white'
                                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200',
                                )}
                              >
                                <span
                                  className={cn(
                                    'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                                    isActive
                                      ? 'bg-primary shadow-[0_0_6px_rgba(109,92,255,0.5)]'
                                      : 'bg-zinc-700 group-hover:bg-zinc-500',
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
                                      : 'bg-white/[0.06] text-zinc-500',
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
                                      className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                                    >
                                      <ChevronLeft className="h-3 w-3" />
                                    </button>
                                    <span className="min-w-[2rem] text-center text-[10px] font-medium tabular-nums text-zinc-500">
                                      {subIdx}/{subCount}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); goSubNext(entry.name); }}
                                      disabled={subIdx >= subCount}
                                      className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                                    >
                                      <ChevronRight className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}

                                {!isActive && showSubNav && (
                                  <span className="shrink-0 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-600">
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
                  <Terminal className="h-5 w-5 text-zinc-600" />
                  <p className="text-[13px] text-zinc-500">No versions yet</p>
                  <code className="rounded-md bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-400">
                    proto-explorer snap "Name"
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ────── LIST: All version groups (always the same) ────── */}
        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{ gridTemplateRows: isList ? '1fr' : '0fr' }}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="py-1">
              <div className="divide-y divide-white/[0.06]">
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
                          ? 'bg-white/[0.04]'
                          : 'hover:bg-white/[0.03]',
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          'text-[14px] font-semibold leading-snug',
                          isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white',
                        )}>
                          {item.group.name}
                        </p>
                        {item.group.description && (
                          <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">
                            {item.group.description}
                          </p>
                        )}
                      </div>
                      <span className={cn(
                        'mt-0.5 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums',
                        isActive
                          ? 'bg-primary/15 text-primary'
                          : 'bg-white/[0.06] text-zinc-500',
                      )}>
                        {item.versionCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-white/[0.06] px-4 py-2">
              <p className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-600">
                <Terminal className="h-3 w-3" />
                <code className="text-zinc-500">proto-explorer snap</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
