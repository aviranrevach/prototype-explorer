import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Layers,
  Clock,
  GitBranch,
  Trash2,
  Boxes,
  Tag,
} from 'lucide-react';
import { useExplorerStore } from '@/stores/explorerStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn, formatDate } from '@/lib/utils';
import { api } from '@/lib/api';

export function GalleryPage() {
  const navigate = useNavigate();
  const { prototypes, fetchPrototypes, createPrototype, deletePrototype } = useExplorerStore();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [versionCounts, setVersionCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchPrototypes();
  }, [fetchPrototypes]);

  useEffect(() => {
    async function loadCounts() {
      const counts: Record<string, number> = {};
      for (const p of prototypes) {
        try {
          const versions = await api.versions.list(p.id);
          counts[p.id] = versions.length;
        } catch {
          counts[p.id] = 0;
        }
      }
      setVersionCounts(counts);
    }
    if (prototypes.length > 0) loadCounts();
  }, [prototypes]);

  const filtered = prototypes.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleCreate() {
    if (!newName.trim()) return;
    const proto = await createPrototype(newName.trim(), newDesc.trim() || undefined);
    setShowCreate(false);
    setNewName('');
    setNewDesc('');
    navigate(`/viewer/${proto.id}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <Boxes className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Snap</h1>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            New Prototype
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {prototypes.length > 0 && (
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search prototypes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((proto) => (
              <div
                key={proto.id}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                onClick={() => navigate(`/viewer/${proto.id}`)}
              >
                <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                  <Layers className="h-10 w-10 text-primary/20" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePrototype(proto.id);
                    }}
                    className="absolute right-2 top-2 rounded-md p-1.5 opacity-0 transition-opacity hover:bg-destructive/20 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold leading-tight">{proto.name}</h3>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatDate(proto.updatedAt)}
                    </span>
                  </div>
                  {proto.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{proto.description}</p>
                  )}
                  <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {versionCounts[proto.id] ?? 0} versions
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : prototypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
              <Layers className="h-8 w-8 text-primary/40" />
            </div>
            <h2 className="text-xl font-semibold">No prototypes yet</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Create your first prototype to start exploring versions, concepts, and scenarios.
            </p>
            <Button className="mt-6" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Create First Prototype
            </Button>
          </div>
        ) : (
          <p className="py-20 text-center text-muted-foreground">No results for "{search}"</p>
        )}
      </main>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogHeader>
          <DialogTitle>New Prototype</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="e.g., Landing Page, Dashboard, Checkout"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Description (optional)</label>
            <Input
              placeholder="What is this prototype about?"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!newName.trim()}>Create</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
