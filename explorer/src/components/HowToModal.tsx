import { useEffect, useRef } from 'react';
import {
  X,
  Terminal,
  Camera,
  ArrowLeftRight,
  Tag,
  Star,
  Keyboard,
  Play,
} from 'lucide-react';

interface HowToModalProps {
  onClose: () => void;
}

const steps = [
  {
    icon: Camera,
    title: 'Snap',
    subtitle: 'Save your work',
    command: 'snap "Homepage"',
    description: 'Captures all your project files as a snapshot. Auto-initializes on first run. Snap often, you can always go back.',
    color: 'from-amber-500/20 to-orange-500/20',
    iconBg: 'bg-amber-500/15 text-amber-400',
  },
  {
    icon: Play,
    title: 'Explore',
    subtitle: 'Browse & compare',
    command: 'snap serve',
    description: 'Opens the visual explorer at localhost:4200 to flip between all your snapshots.',
    color: 'from-pink-500/20 to-rose-500/20',
    iconBg: 'bg-pink-500/15 text-pink-400',
  },
  {
    icon: Terminal,
    title: 'Interactive',
    subtitle: 'Manage from terminal',
    command: 'snap',
    description: 'Run with no arguments to browse versions, snap, restore, and switch groups interactively.',
    color: 'from-violet-500/20 to-purple-500/20',
    iconBg: 'bg-violet-500/15 text-violet-400',
  },
];

const tips = [
  {
    icon: ArrowLeftRight,
    title: 'Restore any version',
    command: 'snap restore <id>',
    description: 'Pull any snapshot back into your working files.',
  },
  {
    icon: Tag,
    title: 'Tag your favorites',
    command: 'snap tag <id> final',
    description: 'Label versions with "final", "dark-mode", etc.',
  },
  {
    icon: Star,
    title: 'Star the best',
    command: 'snap star <id>',
    description: 'Mark standout versions for quick access.',
  },
  {
    icon: Keyboard,
    title: 'Keyboard shortcuts',
    command: null,
    description: 'Arrow keys navigate. Cmd+. toggles pill. Cmd+K opens palette.',
  },
];

export function HowToModal({ onClose }: HowToModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-[min(95vw,44rem)] max-h-[90vh] overflow-y-auto rounded-3xl border border-glass-border bg-glass shadow-[0_32px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-glass-divide bg-glass px-8 py-6 backdrop-blur-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[22px] font-bold text-foreground">How to use Snap</h2>
              <p className="mt-1 text-[14px] text-muted-foreground">Save, organize, and browse your coded prototypes</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-glass-active hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Getting started */}
        <div className="px-8 pt-8 pb-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Getting started</h3>
        </div>

        <div className="space-y-3 px-6">
          {steps.map((step, i) => (
            <div key={step.title} className={`flex gap-5 rounded-2xl bg-gradient-to-r ${step.color} border border-glass-divide p-5`}>
              {/* Big step number */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-glass-active text-[20px] font-bold tabular-nums text-foreground">
                  {i + 1}
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step.iconBg}`}>
                  <step.icon className="h-5 w-5" />
                </div>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-[16px] font-bold text-foreground">{step.title}</p>
                <p className="text-[13px] font-medium text-muted-foreground">{step.subtitle}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{step.description}</p>
                <code className="mt-3 inline-block rounded-lg bg-glass-active px-3 py-1.5 text-[12px] font-semibold text-primary">
                  {step.command}
                </code>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="px-8 pt-8 pb-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Tips & shortcuts</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 px-6 pb-8">
          {tips.map((tip) => (
            <div key={tip.title} className="flex gap-3 rounded-xl border border-glass-divide bg-glass-subtle p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-glass-active text-muted-foreground">
                <tip.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground">{tip.title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{tip.description}</p>
                {tip.command && (
                  <code className="mt-1.5 inline-block rounded-md bg-glass-active px-2 py-0.5 text-[11px] font-medium text-primary">
                    {tip.command}
                  </code>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
