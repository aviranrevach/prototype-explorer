import { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useExplorerStore } from '@/stores/explorerStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useVersionNav } from '@/hooks/useVersionNav';
import { FloatingPill } from '@/components/FloatingPill';
import { api } from '@/lib/api';

function HoverZone({ visible, onEnter }: { visible: boolean; onEnter: () => void }) {
  const menuPosition = usePreferencesStore((s) => s.menuPosition);
  if (!visible) return null;

  const isBottom = menuPosition.startsWith('bottom');
  return (
    <div
      className={`fixed left-0 right-0 z-30 h-2 cursor-pointer ${isBottom ? 'bottom-0' : 'top-0'}`}
      onMouseEnter={onEnter}
    />
  );
}

export function ViewerPage() {
  const { prototypeId, versionId } = useParams<{
    prototypeId: string;
    versionId?: string;
  }>();
  const {
    currentPrototype,
    fetchPrototypes,
    loadPrototype,
    pillVisible,
    togglePill,
    showPill,
    currentVersion,
    selectVersion,
  } = useExplorerStore();

  useEffect(() => {
    void fetchPrototypes();
  }, [fetchPrototypes]);

  useEffect(() => {
    if (prototypeId) {
      loadPrototype(prototypeId);
    }
  }, [prototypeId, loadPrototype]);

  useEffect(() => {
    if (versionId) {
      selectVersion(versionId);
    }
  }, [versionId, selectVersion]);

  const handleTogglePill = useCallback(() => togglePill(), [togglePill]);
  useKeyboard('.', handleTogglePill, true);
  useKeyboard('Escape', () => {
    if (!pillVisible) showPill();
  });
  useVersionNav();

  const version = currentVersion();
  const isReady = currentPrototype?.id === prototypeId;
  const previewUrl =
    isReady && version
      ? api.versions.previewUrl(prototypeId!, version.id)
      : null;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {previewUrl ? (
        <iframe
          key={version?.id}
          src={previewUrl}
          className="h-full w-full border-0"
          title="Prototype preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          {!isReady ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-primary" />
          ) : (
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">
                No versions yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground/60">
                Use the floating bar below or create a snapshot via CLI.
              </p>
            </div>
          )}
        </div>
      )}

      <FloatingPill prototypeName={currentPrototype?.name || ''} />

      <HoverZone visible={!pillVisible} onEnter={showPill} />
    </div>
  );
}
