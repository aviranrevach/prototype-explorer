import { useState } from 'react';
import {
  Star,
  StickyNote,
  Tags,
  Trash2,
  Clipboard,
} from 'lucide-react';
import { useExplorerStore } from '@/stores/explorerStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ActionsMenuProps {
  onClose: () => void;
}

export function ActionsMenu({ onClose }: ActionsMenuProps) {
  const {
    currentVersion,
    currentPrototype,
    currentGroup,
    loadPrototype,
  } = useExplorerStore();

  const version = currentVersion();
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState(version?.notes || '');
  const [showTags, setShowTags] = useState(false);
  const [tagText, setTagText] = useState(version?.tags.join(', ') || '');
  const [showDelete, setShowDelete] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  if (!version || !currentPrototype) {
    return (
      <div className="w-52 rounded-xl border border-white/10 bg-zinc-900/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl animate-slide-up">
        <p className="text-sm text-zinc-500">No version selected</p>
      </div>
    );
  }

  async function handleStar() {
    if (!version || !currentPrototype) return;
    await api.versions.update(currentPrototype.id, version.id, { starred: !version.starred });
    await loadPrototype(currentPrototype.id);
    onClose();
  }

  async function handleSaveNotes() {
    if (!version || !currentPrototype) return;
    await api.versions.update(currentPrototype.id, version.id, { notes: noteText });
    await loadPrototype(currentPrototype.id);
    setShowNotes(false);
    onClose();
  }

  async function handleSaveTags() {
    if (!version || !currentPrototype) return;
    const tags = tagText.split(',').map((t) => t.trim()).filter(Boolean);
    await api.versions.update(currentPrototype.id, version.id, { tags });
    await loadPrototype(currentPrototype.id);
    setShowTags(false);
    onClose();
  }

  async function handleDelete() {
    if (!version || !currentPrototype) return;
    await api.versions.delete(currentPrototype.id, version.id);
    await loadPrototype(currentPrototype.id);
    setShowDelete(false);
    onClose();
  }

  async function handleCopyForAI() {
    if (!currentPrototype) return;
    try {
      const groupId = currentGroup?.id;
      const md = await api.ai.exportMarkdown(groupId);
      await navigator.clipboard.writeText(md);
      setCopyFeedback(true);
      setTimeout(() => { setCopyFeedback(false); onClose(); }, 1200);
    } catch {
      onClose();
    }
  }

  const items = [
    {
      icon: Clipboard,
      label: copyFeedback ? 'Copied!' : 'Copy for AI',
      className: copyFeedback ? 'text-green-400' : '',
      action: handleCopyForAI,
    },
    {
      icon: Star,
      label: version.starred ? 'Unstar' : 'Star',
      className: version.starred ? 'text-warning' : '',
      action: handleStar,
    },
    { icon: StickyNote, label: 'Notes', action: () => setShowNotes(true) },
    { icon: Tags, label: 'Edit Tags', action: () => setShowTags(true) },
    {
      icon: Trash2,
      label: 'Delete',
      className: 'text-destructive hover:!bg-destructive/10',
      action: () => setShowDelete(true),
    },
  ];

  return (
    <>
      <div className="w-52 rounded-xl border border-white/10 bg-zinc-900/95 py-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl animate-slide-up">
        {items.map(({ icon: Icon, label, className, action }) => (
          <button
            key={label}
            onClick={action}
            className={cn(
              'flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white',
              className,
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Notes dialog */}
      <Dialog open={showNotes} onOpenChange={setShowNotes}>
        <DialogHeader>
          <DialogTitle>Edit Notes</DialogTitle>
        </DialogHeader>
        <textarea
          className="w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px] resize-none"
          placeholder="Add notes about this version..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowNotes(false)}>Cancel</Button>
          <Button onClick={handleSaveNotes}>Save</Button>
        </DialogFooter>
      </Dialog>

      {/* Tags dialog */}
      <Dialog open={showTags} onOpenChange={setShowTags}>
        <DialogHeader>
          <DialogTitle>Edit Tags</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="minimalist, round-2, bold"
          value={tagText}
          onChange={(e) => setTagText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSaveTags()}
          autoFocus
        />
        <p className="mt-2 text-xs text-muted-foreground">Comma-separated. Tags act as scenario filters.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowTags(false)}>Cancel</Button>
          <Button onClick={handleSaveTags}>Save</Button>
        </DialogFooter>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogHeader>
          <DialogTitle>Delete Version</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Delete "{version.name}"? This removes the snapshot files permanently.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
