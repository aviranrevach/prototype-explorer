import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Eye,
  Plus,
  Clipboard,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExplorerStore } from '@/stores/explorerStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Action {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [contextDialog, setContextDialog] = useState(false);
  const [contextText, setContextText] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { currentPrototype, currentVersion, togglePill } = useExplorerStore();

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  useKeyboard('k', handleToggle, true);
  useKeyboard('Escape', () => { if (open) setOpen(false); });

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const actions: Action[] = [
    {
      id: 'toggle-pill',
      label: 'Toggle Navigation Bar',
      description: 'Show/hide the floating pill (Cmd+.)',
      icon: Eye,
      action: () => { togglePill(); setOpen(false); },
      keywords: ['pill', 'bar', 'hide', 'show'],
    },
  ];

  actions.push(
    {
      id: 'copy-for-ai',
      label: 'Copy Project for AI',
      description: 'Export full project summary to clipboard',
      icon: Clipboard,
      action: async () => {
        try {
          const md = await api.ai.exportMarkdown();
          await navigator.clipboard.writeText(md);
          setCopyFeedback(true);
          setTimeout(() => setCopyFeedback(false), 2000);
        } catch { /* silent */ }
        setOpen(false);
      },
      keywords: ['ai', 'export', 'copy', 'clipboard', 'paste'],
    },
    {
      id: 'view-context',
      label: 'View Project Context',
      description: 'Read the project context file',
      icon: FileText,
      action: async () => {
        try {
          const text = await api.context.get();
          setContextText(text || 'No context file yet.\n\nRun `proto-explorer context generate` to create one.');
        } catch {
          setContextText('Could not load context.');
        }
        setOpen(false);
        setContextDialog(true);
      },
      keywords: ['context', 'brief', 'handoff', 'notes'],
    },
  );

  if (currentPrototype) {
    actions.push(
      {
        id: 'new-prototype',
        label: 'New Prototype',
        description: 'Create a new prototype',
        icon: Plus,
        action: () => { navigate('/'); setOpen(false); },
        keywords: ['create', 'new', 'prototype'],
      },
    );
  }

  const filtered = actions.filter((a) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      a.label.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.keywords?.some((k) => k.includes(q))
    );
  });

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[selectedIndex]?.action();
    }
  }

  return (
    <>
      {/* Copy feedback toast */}
      {copyFeedback && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg border border-white/10 bg-zinc-900/95 px-4 py-2 text-sm text-white shadow-xl backdrop-blur-xl animate-fade-in">
          Copied to clipboard
        </div>
      )}

      {/* Context dialog */}
      {contextDialog && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
          onClick={() => setContextDialog(false)}
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <h2 className="text-sm font-medium text-white">Project Context</h2>
              <button
                onClick={() => setContextDialog(false)}
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                ESC
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-mono leading-relaxed">{contextText}</pre>
            </div>
            <div className="border-t border-white/10 px-5 py-3">
              <p className="text-xs text-zinc-500">
                Edit via CLI: <code className="rounded bg-white/5 px-1.5 py-0.5">proto-explorer context edit</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Command palette */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          onClick={() => setOpen(false)}
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-4 w-4 text-zinc-500" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search actions..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
              <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-500">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-64 overflow-y-auto py-2">
              {filtered.length > 0 ? (
                filtered.map((action, i) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      selectedIndex === i ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5',
                    )}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    <action.icon className="h-4 w-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{action.label}</div>
                      <div className="text-xs text-zinc-500 truncate">{action.description}</div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-4 py-6 text-center text-sm text-zinc-500">No matching actions</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
