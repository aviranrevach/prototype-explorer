# Future Development

Ideas and improvements to consider. Not prioritized, not committed - just captured.

---

## Snapshots

- **Multi-file snapshots** - support snapping a folder with `index.html` + separate CSS, JS, and image files instead of only single-file HTML. Serve the folder as static files in the preview iframe. Useful for more complex prototypes that need external assets.

## Storage

- **Explicit chapter ordering** - chapters are currently sorted by `updatedAt` descending, making manual reordering impossible without editing meta.json timestamps. Add an `order` field to `VersionGroup` so users can reorder chapters without hacks.

- **Dedup snaps** - hash each file, only store unique content. If 45/50 files are identical between snaps, store them once. Could reduce storage 80-90% for projects with many snaps.
- **Diff-based storage** - only store changed files since last snap. Smaller but slower restores.
- **Snap size indicator** - show file count and total size in `snap action` and the TUI so users know how much space they're using.
- **Cleanup command** - `snap cleanup` to remove old takes or entire chapters, with a dry-run preview.

## CLI

- **`snap diff 1.1 2.1`** - show what changed between two rounds/takes, using the numbered references from `snap action`.
- **`snap rename`** - rename a round, chapter, or prototype without creating a new one.
- **`snap move`** - move a round from one chapter to another.
- **Global install experience** - `npx snap-proto` or `npm install -g snap-proto` should just work. Test the full install-to-first-snap flow.

## TUI

- **Ink-based persistent UI** - replace @clack/prompts with Ink for a richer, keyboard-driven interface. Live-updating version list, inline previews, arrow key navigation between takes.
- **Unsaved changes detection** - compare working files against last snap, show "3 files changed since last snap" at the top of the TUI.
- **File preview in terminal** - show a quick diff or file list when browsing takes.

## Explorer (Web UI)

- **Side-by-side compare** - load two takes or rounds in split view.
- **Timeline view** - visual timeline of all snaps across chapters.
- **Search** - search across round names, tags, notes.
- **Thumbnail previews** - auto-capture screenshots of each snap for visual browsing.
- **Mobile responsive** - the floating pill and drawer should work on mobile browsers.

## AI Integration

- **`snap action` as a skill** - register snap action as a Claude Code skill so it runs automatically when the user asks about their project.
- **Auto-snap on AI changes** - hook into AI tools to auto-snap before/after AI makes changes, so you can always revert.
- **AI-generated round names** - when snapping without a name, AI suggests one based on what changed.
- **Compare with AI** - `snap compare 1.1 2.1` generates a designer-friendly comparison using AI.

## Collaboration

- **Cloud sync** - optional remote storage so teams can share prototypes.
- **Comments on takes** - leave feedback on specific takes, visible in the explorer.
- **Share links** - generate a temporary public URL for a specific take or chapter.
- **Export to Figma** - push snap previews to Figma for stakeholder review.

## Naming & Concepts

- **Category rethink** - currently "Scenarios" is the default category. Consider if categories add enough value or if chapters + rounds + takes is sufficient structure.
- **Rename .proto-explorer/** - the internal directory still uses the old name. A future major version could rename to `.snap/` with a migration.
