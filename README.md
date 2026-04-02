# Snapp

**Version control for HTML prototypes, built for product designers who code.**

Snapp is for standalone HTML/CSS/JS prototypes, not React, Vue, or framework projects. You edit a single `index.html` file, save snapshots of it, and browse your saved versions in a visual explorer. That's it.

You're building prototypes to explore product directions. Maybe it's an onboarding flow, a dashboard redesign, a new navigation concept. You try things, iterate, go in different directions - and before you know it, your coded prototypes are a hot, unorganized, inaccessible mess. Unlike your Figma files where everything is collaborative and browsable, your code prototypes just pile up in folders with no structure, no history, and no way to flip between the cool concepts you created.

No more. Snapp saves snapshots of your `index.html`, organizes them into groups you define, and gives you a minimal floating UI to flip between everything - right inside the browser.
Install it for yourself, and your teammates. Your product team needs this.

No cloud. No accounts. Just `npm install` and go.

---

## How it works

1. You edit one file: `index.html`
2. Each time you run `snapp`, it saves a copy of that file as a snapshot
3. The explorer shows your saved versions in an iframe so you can flip between them

That's the whole model. One file in, snapshots out, visual browsing.

---

## Vibe prototyping process

These are the building blocks. If you've never used version control before, this is your intro, and once you get it, you'll wonder how you worked without it.

### Prototype

The thing you're exploring. It can be a single page, a full flow, a navigation concept, or a complete workable prototype for testing product directions.

Examples: "Onboarding Flow", "Dashboard Redesign", "Ticket Management", "Settings Navigation"

### Snap

A saved copy of your `index.html` at this exact moment. Like pressing "save" in a way you can always come back to (like in Figma's document history).

Developers call this a **"commit"** - `snapp` is your version of that. Every time you snapp, your `index.html` is copied and stored safely as a new version. You can keep building without worrying about losing what you had before.

### Chapter

A round of exploration. When you start a fresh direction for the same prototype, you create a new chapter. Think of chapters as phases in your design process:

- "Dashboard v1" - your first take
- "Dashboard v2" - new direction after feedback
- "Dashboard v3" - the refined version. Maybe even final!

### Round

A named entry within a chapter. "Homepage", "Login Page", "Settings" - each is a round you're working on.

### Take

When you snapp the same name twice, the snaps stack up as takes. You flip between them with arrow keys or numbered buttons, both in the drawer and on the floating pill. This is like having an undo history for one specific design. You can always go back to see how it looked three iterations ago.

### Restore

Your working file is always whatever you last edited - there's only one `index.html` at any time. When you snapp, you save a copy, but you keep working on the same file. If you break something, go too far in a direction, or just want to pick up from where an older snap left off, `restore` replaces your current `index.html` with that snap's saved copy. It's your undo button across time.

### Tags

Labels you attach to any snap. Use them for status ("exploration", "final", "rejected", "stakeholder-approved") or style ("dark-mode", "minimal", "bold"). Tags help you find things later and give AI better context when you export your project.

---

## Quick start

```bash
npm install -g snap-proto
```

| Step | Command | What it does |
| --- | --- | --- |
| **1. Init** | `snapp init` | Creates a project and a starter `index.html` |
| **2. Edit** | Edit `index.html` | Your prototype lives here, all HTML/CSS/JS in one file |
| **3. Snap** | `snapp "My Design"` | Saves a copy of your `index.html` as a snapshot |
| **4. Explore** | `snapp serve` | Opens the explorer at `http://localhost:4200` to browse all snapshots |
| **5. Action** | `snapp action` | Shows your full project tree and what you can do next |

That's it. Edit, snap, browse.

### Project overview

Run `snapp action` to see your full project at a glance:

```
📦 Task Management App
[01] 📖 V1 Dashboard
 ├─ 1.1 Notification Center (3 takes) ← you are here, working on take 3
 ├─ 1.2 Activity Feed (1 take)
 └─ 1.3 Team Settings (1 take)
[02] 📖 V2 Dark Theme
 ├─ 2.1 Notification Center (2 takes)
 └─ 2.2 Activity Feed (1 take)

What would you like to do next?
 1. SNAP current index.html (new round or take)
 2. START a new chapter
 3. SWITCH to a different snap to build from
 4. OPEN visual explorer
 5. MORE things you can do
```

Every round is numbered so you can reference them easily: "add a take to 1.1", "compare 1.1 and 2.1", "switch to 2.2".

### Interactive mode

Run `snapp` with no arguments to open the interactive terminal UI:

```bash
snapp
```

Browse rounds, create snaps, switch chapters, and restore - all from an interactive menu. On first run, it walks you through setup.

### Organize when you're ready

These commands are optional - use them when you want more structure:

```bash
snapp chapter "Dashboard v2"  # start a new chapter of exploration
snapp new "Settings Page"     # create a separate prototype
```

---

## The UI

### Floating pill

A minimal pill sits at the bottom-left, showing the current chapter name and active round. If a round has multiple takes, numbered buttons or arrow buttons appear to flip between them.

**Toggle visibility:** `Cmd + .` or hover the bottom edge of the screen.

### Drawer (two levels)

Click the pill to open the drawer:

**Level 1 - Rounds:** Shows all categories and entries within the current chapter. Click any entry to load its preview. Use the `< 2/3 >` arrows to flip takes of the same round.

**Level 2 - Chapters:** Click the header or the chevron to collapse to the chapter list. This shows every chapter across all prototypes, always the same list regardless of where you are. Click any chapter to drill in.

### Command palette

`Cmd + K` opens a command palette for quick actions, including "Copy for AI" which exports your full project to the clipboard.

---

## Every command, explained

### Overview

**`snapp action`**
Shows your full project tree with numbered rounds and chapters, plus a menu of what you can do next. Use this when working with AI - the numbered references make it easy to talk about specific rounds.

### Snapshots and versions

**`snapp <name>`**
Saves a copy of your current `index.html` as a named snapshot.
*Use every time you reach a point worth saving: before you try something new, after you finish a direction, or when something just feels right.*

```bash
snapp "Ideal Flow"
```

Snap the same name again to create another take you can flip between:

```bash
snapp "Ideal Flow"   # now you have 2 takes
```

**Snap options:** you can control where the snap lands and how it's labeled:

```bash
# Put it in a specific chapter
snapp "Ideal Flow" --group <chapter-id>

# Label it under a custom category (default is "Scenarios")
snapp "Empty State" --category "Edge Cases"

# Add tags for status or intent
snapp "Bulk Selection" --tag exploration needs-review

# Add a short description
snapp "Error State" --desc "What happens when the API call fails"
```

**`snapp restore <id>`**
Replaces your current `index.html` with a previously saved snapshot.
*Use when you want to go back to an earlier version, maybe to build on it or compare it side by side with what you have now.*

```bash
snapp restore abc123
```

**`snapp list`**
Shows all your prototypes, groups, and versions in the terminal.
*Use when you want a quick overview without opening the explorer. Add `-v` to see every individual version.*

```bash
snapp list -v
```

**`snapp rm <id>`**
Deletes a version permanently.
*Use when a snap is just noise and you want to clean up.*

### Organizing

**`snapp chapter <name>`**
Creates a new chapter inside your prototype - a new round of exploration.

```bash
snapp chapter "Checkout v2"
```

**`snapp new <name>`**
Creates a new prototype - the thing you're building.

```bash
snapp new "Checkout Experience"
```

**`snapp tag <id> <tags...>`**
Adds or removes tags on a version.
*Use to mark a version's status or intent: "final", "rejected", "show-to-PM", "needs-work".*

```bash
snapp tag abc123 final stakeholder-approved
```

**`snapp star <id>`**
Toggles a star on a version.
*Use to mark your favorites - the ones worth showing or coming back to.*

**`snapp note <id> <text>`**
Attaches a note to a version.
*Use to capture decisions, feedback, or context while it's still fresh. "PM liked this direction but wants more contrast."*

```bash
snapp note abc123 "Stakeholder approved - ship this direction"
```

### Collaboration and AI

**`snapp context`**
View, edit, or auto-generate your project context file.
*Context is your project's memory: goals, audience, design decisions, constraints. Write it for your teammates and your future self.*

```bash
snapp context generate   # auto-generate from your project structure
snapp context edit       # open in your editor
snapp context            # view in terminal
```

**`snapp brief <chapter-id> <text>`**
Sets a short brief on a chapter - what this round of exploration is about.
*Use before asking AI to compare chapters, or when handing off to a teammate.*

```bash
snapp brief abc123 "Exploring bold typography and dark color palettes"
```

**`snapp export`**
Generates a complete summary of your project: context, hierarchy, notes, file listings. In a format AI tools and teammates can read.
*Use whenever you want to hand off your work, get AI feedback, or just see everything in one place.*

```bash
snapp export              # print to terminal
snapp export --clipboard  # copy to clipboard (paste into AI)
snapp export --json       # structured JSON instead of markdown
snapp export --group <id> # just one group
```

---

## Using with AI

You don't need to memorize commands. Most of the time, you just talk to AI and it edits your `index.html` directly.

### Start with `snapp action`

Run `snapp action` to show your project tree. AI sees the numbered rounds and can reference them directly. Then just tell it what you want: "add a take to 1.1", "compare 1.1 and 2.1", "start a new chapter called Dark Theme".

### Just talk - AI edits your index.html

These prompts work as-is. AI reads your `index.html`, makes changes, and you snap the result.

| What you want | Say this to AI | Then save the result |
| --- | --- | --- |
| **Simplify a busy layout** | *"This dashboard has too much going on. Keep the **data table** and **filters**, remove the secondary charts, tighten the spacing."* | `snapp "Dashboard Overview"` - snapping the same name stacks takes you can flip between |
| **Generate multiple options** | *"Give me three variations of this **settings page**: one **minimal**, one with a **bold sidebar**, one with **grouped cards**."* | Snap each one: `snapp "Option A - Minimal"`, `snapp "Option B - Bold Sidebar"`, etc. |
| **Iterate on a direction** | *"Make the **hero section** bolder: bigger type, more contrast, and swap the illustration for a **full-bleed photo**."* | `snapp "Hero - Bold"` |
| **Explore concepts** | *"Explore 5 different directions for this **settings page**. Try different layouts, visual hierarchies, and grouping styles. After each one, run `snapp "Settings Concepts"` so I can flip through them."* | AI generates each direction one at a time. Snapping the same name after each one creates takes: Settings Concepts `< 1/5 >` you flip through with arrow keys |
| **Fix or polish** | *"The spacing feels off on **mobile**. Tighten the **card grid** and make the **nav** collapse into a hamburger."* | `snapp "Mobile Polish"` |

### One command first, then talk

For anything that involves your *saved snaps* (comparing versions, combining pieces, organizing), AI needs your project data. Run one command, then prompt away.

**To give AI your full project:**

```bash
snapp export --clipboard
```

Or press `Cmd + K` in the explorer and choose **"Copy Project for AI"**.

Then paste it into your AI tool and ask:

| What you want | Say this to AI |
| --- | --- |
| **Combine pieces from different versions** | *"Take the **chat widget** from the **Support Page** snap and the **sidebar nav** from **Dashboard Overview**. Combine them into one page with the nav on the left and chat on the right."* |
| **Compare two versions** | *"Compare these two versions of the **onboarding flow**. Describe the differences the way a designer would: layout, color, typography, what got added or removed."* |
| **Organize your mess** | *"Here's everything I have. Suggest how to organize these into **prototypes**, **chapters**, and **categories**. Give me the exact commands to run."* |
| **Summarize for stakeholders** | *"Summarize what I've been exploring. For each **chapter**, highlight the key design decisions and open questions. Keep it to 2-3 bullets per chapter."* |
| **Get feedback on a direction** | *"Look at my latest snaps in the **Dashboard v2** group. What's working? What feels inconsistent? What would you push further?"* |

In **Cursor**, AI can read directly from `.proto-explorer/`, no export needed. The export step is only for tools like **ChatGPT or Claude** that don't have file access.

### Giving AI more context

The more context your project has, the better AI's suggestions get. These build up over time:

| What to do | How |
| --- | --- |
| **Auto-generate project context** | `snapp context generate` - scans your project and creates a context summary |
| **Edit it yourself** | `snapp context edit` - add goals, audience, constraints, design decisions |
| **Set a brief on a chapter** | `snapp brief <chapter-id> "Exploring bolder typography and dark palettes"` |

Context and briefs are included automatically whenever you export, so AI always has the full picture.

**See [AI_GUIDE.md](AI_GUIDE.md) for more prompts, workflows, and the mindset behind combining AI with prototype exploration.**

---

## For contributors

Tech stack, development setup, and project structure

### Tech stack


| Layer     | Tech                                        |
| --------- | ------------------------------------------- |
| CLI       | Node.js, Commander.js, @clack/prompts       |
| Server    | Express 5                                   |
| Explorer  | React 19, Vite, TypeScript, Tailwind CSS v4 |
| State     | Zustand                                     |
| Storage   | Local filesystem (`.proto-explorer/`)       |


### Development

```bash
# Install dependencies
pnpm install

# Build everything
pnpm build

# Dev mode (CLI watch + explorer dev server)
pnpm dev:cli        # watches CLI source
pnpm dev:explorer    # starts Vite dev server

# Seed demo data for testing
node scripts/seed-demo.mjs
snapp serve
```

### Project structure

```
src/
├── commands/       <- CLI commands (snapp, serve, group, etc.)
├── core/           <- Storage, snapshots, types, ensure-init
├── tui/            <- Interactive terminal UI (welcome, main)
└── server/         <- Express API + static explorer serving

explorer/
└── src/
    ├── components/ <- FloatingPill, VersionDrawer, ActionsMenu, etc.
    ├── stores/     <- Zustand store (explorerStore)
    ├── pages/      <- ViewerPage
    ├── hooks/      <- Keyboard shortcuts, navigation
    └── lib/        <- API client, utilities
```

### Storage layout

```
.proto-explorer/
├── config.json          <- contains sourceFile: "index.html"
├── context.md           <- project context for collaboration & AI
└── prototypes/
    └── {id}/
        ├── meta.json
        ├── groups/
        │   └── {gid}/
        │       ├── meta.json
        │       └── brief.md   <- group-level brief
        └── versions/
            └── {vid}/
                ├── meta.json
                └── files/     <- saved copy of index.html
```



---

## License

MIT
