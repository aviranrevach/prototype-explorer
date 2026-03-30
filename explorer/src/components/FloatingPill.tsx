import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useExplorerStore } from '@/stores/explorerStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { VersionDrawer } from './VersionDrawer';

interface FloatingPillProps {
  prototypeName: string;
}

export function FloatingPill({ prototypeName }: FloatingPillProps) {
  const {
    pillVisible,
    drawerOpen,
    closeOnLeave,
    currentVersion,
    currentGroup,
    subVersionsOf,
    goSubNext,
    goSubPrev,
    goToSubIndex,
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
      if (Date.now() - mountedAt.current < 200) return;
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [handleClose]);

  const menuPosition = usePreferencesStore((s) => s.menuPosition);
  const subNavStyle = usePreferencesStore((s) => s.subNavStyle);

  if (!pillVisible) return null;

  const version = currentVersion();
  const subs = version ? subVersionsOf(version.name) : [];
  const subTotal = subs.length;
  const subIndex = version ? subs.findIndex((s) => s.id === version.id) + 1 : 0;
  const showSubNav = subTotal > 1;

  const isBottom = menuPosition.startsWith('bottom');
  const isLeft = menuPosition.endsWith('left');

  const pillPositionClass = [
    'fixed z-40 animate-pill-enter',
    isBottom ? 'bottom-5' : 'top-5',
    isLeft ? 'left-5' : 'right-5',
  ].join(' ');

  const drawerPositionClass = [
    'absolute',
    isBottom ? 'bottom-full mb-3' : 'top-full mt-3',
    isLeft ? 'left-0' : 'right-0',
  ].join(' ');

  return (
    <div ref={pillRef} className={pillPositionClass} style={{ transform: 'none' }}>
      {drawerOpen && (
        <div
          className={`${drawerPositionClass} ${closing ? 'animate-drawer-exit' : ''}`}
          onAnimationEnd={handleAnimationEnd}
          onMouseLeave={() => { if (closeOnLeave) handleClose(); }}
        >
          <VersionDrawer onClose={handleClose} />
        </div>
      )}

      <div className="flex items-center gap-0.5 rounded-full border border-glass-border bg-glass-pill px-1.5 py-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <button
          onClick={toggleDrawer}
          className="flex items-center gap-2 rounded-full pl-2.5 pr-4 py-0.5 transition-colors hover:bg-glass-hover"
        >
          <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-col items-start leading-none">
            {currentGroup && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {currentGroup.name}
              </span>
            )}
            <span className="max-w-[180px] truncate text-sm font-medium text-foreground">
              {version ? version.name : prototypeName}
            </span>
          </div>
        </button>

        {showSubNav && subNavStyle === 'chevron' && (
          <>
            <button
              onClick={() => version && goSubPrev(version.name)}
              disabled={subIndex <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-glass-active hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <span className="rounded-md bg-glass-active px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
              {subIndex}/{subTotal}
            </span>

            <button
              onClick={() => version && goSubNext(version.name)}
              disabled={subIndex >= subTotal}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-glass-active hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}

        {showSubNav && subNavStyle === 'numbered' && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => version && goSubPrev(version.name)}
              disabled={subIndex <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-glass-active hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {subs.map((_, i) => (
              <button
                key={i}
                onClick={() => version && goToSubIndex(version.name, i)}
                className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-[11px] font-medium tabular-nums transition-colors ${
                  i + 1 === subIndex
                    ? 'bg-glass-active text-foreground'
                    : 'text-muted-foreground hover:bg-glass-hover hover:text-foreground'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </button>
            ))}

            <button
              onClick={() => version && goSubNext(version.name)}
              disabled={subIndex >= subTotal}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-glass-active hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
