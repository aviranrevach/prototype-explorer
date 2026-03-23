import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useExplorerStore } from '@/stores/explorerStore';
import { VersionDrawer } from './VersionDrawer';

interface FloatingPillProps {
  prototypeName: string;
}

export function FloatingPill({ prototypeName }: FloatingPillProps) {
  const {
    pillVisible,
    drawerOpen,
    currentVersion,
    currentGroup,
    subVersionsOf,
    goSubNext,
    goSubPrev,
    toggleDrawer,
    closeDrawer,
  } = useExplorerStore();

  const [closing, setClosing] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const handleClose = useCallback(() => {
    if (!drawerOpen || closing) return;
    setClosing(true);
  }, [drawerOpen, closing]);

  function handleAnimationEnd() {
    if (closing) {
      setClosing(false);
      closeDrawer();
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Skip click-outside briefly after mount to avoid closing from navigation clicks
      if (Date.now() - mountedAt.current < 200) return;
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [handleClose]);

  if (!pillVisible) return null;

  const version = currentVersion();
  const subs = version ? subVersionsOf(version.name) : [];
  const subTotal = subs.length;
  const subIndex = version ? subs.findIndex((s) => s.id === version.id) + 1 : 0;
  const showSubNav = subTotal > 1;

  return (
    <div ref={pillRef} className="fixed bottom-5 left-5 z-40 animate-pill-enter" style={{ transform: 'none' }}>
      {drawerOpen && (
        <div
          className={`absolute bottom-full left-0 mb-3 ${closing ? 'animate-drawer-exit' : ''}`}
          onAnimationEnd={handleAnimationEnd}
        >
          <VersionDrawer onClose={handleClose} />
        </div>
      )}

      <div className="flex items-center gap-0.5 rounded-full border border-white/10 bg-zinc-900/95 px-1.5 py-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <button
          onClick={toggleDrawer}
          className="flex items-center gap-2 rounded-full pl-2.5 pr-4 py-0.5 transition-colors hover:bg-white/[0.06]"
        >
          <Layers className="h-4 w-4 shrink-0 text-zinc-400" />
          <div className="flex flex-col items-start leading-none">
            {currentGroup && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {currentGroup.name}
              </span>
            )}
            <span className="max-w-[180px] truncate text-sm font-medium text-white">
              {version ? version.name : prototypeName}
            </span>
          </div>
        </button>

        {showSubNav && (
          <>
            <button
              onClick={() => version && goSubPrev(version.name)}
              disabled={subIndex <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <span className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-zinc-400">
              {subIndex}/{subTotal}
            </span>

            <button
              onClick={() => version && goSubNext(version.name)}
              disabled={subIndex >= subTotal}
              className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
