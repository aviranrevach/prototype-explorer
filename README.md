# Prototype Explorer

**Version control for design exploration - built for product designers who code.**

You're building prototypes to explore product directions. Maybe it's an onboarding flow, a dashboard redesign, a new navigation concept. You try things, iterate, go in different directions- and before you know it, your coded prototypes are a hot, unorganized, inaccessible mess. Unlike your Figma files where everything is collaborative and browsable, your code prototypes just pile up in folders with no structure, no history, and no way to flip between the cool concepts you created.

No more. Prototype Explorer saves snapshots of your prototypes, organizes them into groups you define, and gives you a minimal floating UI to flip between everything — right inside the browser, right inside your project.
Install it for yourself, and your teammates. Your product team needs this.

No cloud. No accounts. Just `npm install` and go.

---

## Vibe prototyping process:

These are the building blocks. If you've never used version control before, this is your intro, and once you get it, you'll wonder how you worked without it.

### Prototype

The thing you're exploring. It can be a single page, a full flow, a navigation concept, or a complete workable prototype for testing product directions.

Examples: "Onboarding Flow", "Dashboard Redesign", "Ticket Management", "Settings Navigation"

### Snap

A snapshot of your code at this exact moment. Like pressing "save" in a way you can always come back to (like in Figma's document history).

Developers call this a **"commit"**- `snap` is your version of that. Every time you snap, Prototype Explorer copies your files and stores them safely as a new prototype. You can keep building without worrying about losing what you had before.

### Version Group

A round of exploration. When you start a fresh direction for the same prototype, you create a new group. Think of groups as chapters in your design process:

- "Dashboard v1" - your first take
- "Dashboard v2" - new direction after feedback
- "Dashboard v3" - the refined version. Maybe even final!

### Category

A label you choose to organize entries within a group. "Scenarios", "Concepts", "Variations", "Flows"- whatever fits how you think about the work. There's no right answer.

### Sub-versions

When you snap the same name twice, the snaps stack up. You flip between them with arrow keys, left and right, both in the drawer and on the floating pill. This is like having an undo history for one specific design. You can always go back to see how it looked three iterations ago.

### Restore

Your working files are always whatever you last edited - there's only one "current" version of your code at any time. When you snap, you save a copy, but you keep working on the same files. If you break something, go too far in a direction, or just want to pick up from where an older snap left off, `restore` replaces your current files with that snap's saved copy. It's your undo button across time.

### Tags

Labels you attach to any snap. Use them for status ("exploration", "final", "rejected", "stakeholder-approved") or style ("dark-mode", "minimal", "bold"). Tags help you find things later and give AI better context when you export your project.

---

## Quick start

```bash
# Install the tool
npm install prototype-explorer
```

Set up Prototype Explorer in your project. This creates a hidden `.proto-explorer/` folder that stores all your snapshots. You never need to touch it directly.

```bash
proto-explorer init
```

Create a prototype - the thing you're exploring:

```bash
proto-explorer new "Onboarding Flow"
```

Create your first version group - a chapter of exploration:

```bash
proto-explorer group "Onboarding v1"
```

You've been working on the ideal flow. Save a snapshot of where things are right now:

```bash
proto-explorer snap "Ideal Flow"
```

Open the explorer to browse everything you've built:

```bash
proto-explorer serve
```

The explorer opens at `http://localhost:4200` with a floating pill at the bottom-left of the screen.

---

## The UI

### Floating pill

A minimal pill sits at the bottom-left, showing the current group name and active scenario. If a scenario has multiple sub-versions, arrow buttons appear to flip between them.

**Toggle visibility:** `Cmd + .` or hover the bottom edge of the screen.

### Drawer (two levels)

Click the pill to open the drawer:

**Level 1 - Scenarios:** Shows all categories and entries within the current version group. Click any entry to load its preview. Use the `< 2/3 >` arrows to flip sub-versions of the same entry.

**Level 2 - Version groups:** Click the header or the chevron to collapse to the group list. This shows every version group across all prototypes, always the same list regardless of where you are. Click any group to drill in.

### Command palette

`Cmd + K` opens a command palette for quick actions, including "Copy for AI" which exports your full project to the clipboard.

---

## Every command, explained

### Getting started

**`proto-explorer init`**
Sets up Prototype Explorer in your project. Run this once. It creates the hidden `.proto-explorer/` folder.

**`proto-explorer new <name>`**
Creates a new prototype - the thing you're building.
*Use when you're starting a new project or page to explore.*

```bash
proto-explorer new "Checkout Experience"
```

**`proto-explorer group <name>`**
Creates a version group inside your prototype - a new round of exploration.
*Use when you're starting a fresh direction. "Checkout v1" was your first attempt; "Checkout v2" is the redesign.*

```bash
proto-explorer group "Checkout v2"
```

**`proto-explorer serve`**
Starts the explorer at `localhost:4200`.
*Use whenever you want to browse, flip between versions, or present your work.*

### Snapshots and versions

**`proto-explorer snap <name>`**
Takes a snapshot of your current files and saves it as a named version.
*Use every time you reach a point worth saving: before you try something new, after you finish a direction, or when something just feels right.*

```bash
proto-explorer snap "Ideal Flow"
```

Snap the same name again to create a sub-version you can flip between:

```bash
proto-explorer snap "Ideal Flow"   # now you have 2 sub-versions
```

**Snap options:** you can control where the snap lands and how it's labeled:

```bash
# Put it in a specific group
proto-explorer snap "Ideal Flow" --group <group-id>

# Label it under a custom category (default is "Scenarios")
proto-explorer snap "Empty State" --category "Edge Cases"

# Add tags for status or intent
proto-explorer snap "Bulk Selection" --tag exploration needs-review

# Add a short description
proto-explorer snap "Error State" --desc "What happens when the API call fails"
```

**`proto-explorer restore <id>`**
Pulls a previous snap back into your working files.
*Use when you want to go back to an earlier version, maybe to build on it or compare it side by side with what you have now.*

```bash
proto-explorer restore abc123
```

**`proto-explorer list`**
Shows all your prototypes, groups, and versions in the terminal.
*Use when you want a quick overview without opening the explorer. Add `-v` to see every individual version.*

```bash
proto-explorer list -v
```

**`proto-explorer rm <id>`**
Deletes a version permanently.
*Use when a snap is just noise and you want to clean up.*

### Organizing

**`proto-explorer tag <id> <tags...>`**
Adds or removes tags on a version.
*Use to mark a version's status or intent: "final", "rejected", "show-to-PM", "needs-work".*

```bash
proto-explorer tag abc123 final stakeholder-approved
```

**`proto-explorer star <id>`**
Toggles a star on a version.
*Use to mark your favorites - the ones worth showing or coming back to.*

**`proto-explorer note <id> <text>`**
Attaches a note to a version.
*Use to capture decisions, feedback, or context while it's still fresh. "PM liked this direction but wants more contrast."*

```bash
proto-explorer note abc123 "Stakeholder approved - ship this direction"
```

### Collaboration and AI

**`proto-explorer context`**
View, edit, or auto-generate your project context file.
*Context is your project's memory: goals, audience, design decisions, constraints. Write it for your teammates and your future self.*

```bash
proto-explorer context generate   # auto-generate from your project structure
proto-explorer context edit       # open in your editor
proto-explorer context            # view in terminal
```

**`proto-explorer brief <group-id> <text>`**
Sets a short brief on a version group - what this round of exploration is about.
*Use before asking AI to compare groups, or when handing off to a teammate.*

```bash
proto-explorer brief abc123 "Exploring bold typography and dark color palettes"
```

**`proto-explorer export`**
Generates a complete summary of your project: context, hierarchy, notes, file listings. In a format AI tools and teammates can read.
*Use whenever you want to hand off your work, get AI feedback, or just see everything in one place.*

```bash
proto-explorer export              # print to terminal
proto-explorer export --clipboard  # copy to clipboard (paste into AI)
proto-explorer export --json       # structured JSON instead of markdown
proto-explorer export --group <id> # just one group
```

---

## Using with AI

You don't need to memorize commands. Most of the time, you just talk to AI and it works. Sometimes you need to run one command first to give AI your project data. We'll tell you when.

### Just talk - no commands needed

These prompts work as-is. AI reads your current files and does the work.

| What you want | Say this to AI | Then save the result |
| --- | --- | --- |
| **Simplify a busy layout** | *"This dashboard has too much going on. Keep the **data table** and **filters**, remove the secondary charts, tighten the spacing."* | `proto-explorer snap "Dashboard Overview"` - snapping the same name stacks sub-versions you can flip between |
| **Generate multiple options** | *"Give me three variations of this **settings page**: one **minimal**, one with a **bold sidebar**, one with **grouped cards**."* | Snap each one: `snap "Option A - Minimal"`, `snap "Option B - Bold Sidebar"`, etc. |
| **Iterate on a direction** | *"Make the **hero section** bolder: bigger type, more contrast, and swap the illustration for a **full-bleed photo**."* | `proto-explorer snap "Hero - Bold"` |
| **Explore concepts** | *"Explore 5 different directions for this **settings page**. Try different layouts, visual hierarchies, and grouping styles. After each one, run `proto-explorer snap "Settings Concepts"` so I can flip through them."* | AI generates each direction one at a time. Snapping the same name after each one creates sub-versions: Settings Concepts `< 1/5 >` you flip through with arrow keys |
| **Fix or polish** | *"The spacing feels off on **mobile**. Tighten the **card grid** and make the **nav** collapse into a hamburger."* | `proto-explorer snap "Mobile Polish"` |

### One command first, then talk

For anything that involves your *saved snaps* (comparing versions, combining pieces, organizing), AI needs your project data. Run one command, then prompt away.

**To give AI your full project:**

```bash
proto-explorer export --clipboard
```

Or press `Cmd + K` in the explorer and choose **"Copy Project for AI"**.

Then paste it into your AI tool and ask:

| What you want | Say this to AI |
| --- | --- |
| **Combine pieces from different versions** | *"Take the **chat widget** from the **Support Page** snap and the **sidebar nav** from **Dashboard Overview**. Combine them into one page with the nav on the left and chat on the right."* |
| **Compare two versions** | *"Compare these two versions of the **onboarding flow**. Describe the differences the way a designer would: layout, color, typography, what got added or removed."* |
| **Organize your mess** | *"Here's everything I have. Suggest how to organize these into **prototypes**, **groups**, and **categories**. Give me the exact commands to run."* |
| **Summarize for stakeholders** | *"Summarize what I've been exploring. For each **version group**, highlight the key design decisions and open questions. Keep it to 2-3 bullets per group."* |
| **Get feedback on a direction** | *"Look at my latest snaps in the **Dashboard v2** group. What's working? What feels inconsistent? What would you push further?"* |

In **Cursor**, AI can read directly from `.proto-explorer/`, no export needed. The export step is only for tools like **ChatGPT or Claude** that don't have file access.

### Giving AI more context

The more context your project has, the better AI's suggestions get. These build up over time:

| What to do | How |
| --- | --- |
| **Auto-generate project context** | `proto-explorer context generate` - scans your project and creates a context summary |
| **Edit it yourself** | `proto-explorer context edit` - add goals, audience, constraints, design decisions |
| **Set a brief on a version group** | `proto-explorer brief <group-id> "Exploring bolder typography and dark palettes"` |

Context and briefs are included automatically whenever you export, so AI always has the full picture.

**See [AI_GUIDE.md](AI_GUIDE.md) for more prompts, workflows, and the mindset behind combining AI with prototype exploration.**

---

## For contributors

Tech stack, development setup, and project structure

### Tech stack


| Layer     | Tech                                        |
| --------- | ------------------------------------------- |
| CLI       | Node.js, Commander.js                       |
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
proto-explorer serve
```

### Project structure

```
src/
├── commands/       ← CLI commands (init, snap, serve, etc.)
├── core/           ← Storage, snapshots, types
└── server/         ← Express API + static explorer serving

explorer/
└── src/
    ├── components/ ← FloatingPill, VersionDrawer, ActionsMenu, etc.
    ├── stores/     ← Zustand store (explorerStore)
    ├── pages/      ← ViewerPage
    ├── hooks/      ← Keyboard shortcuts, navigation
    └── lib/        ← API client, utilities
```

### Storage layout

```
.proto-explorer/
├── config.json
├── context.md             ← project context for collaboration & AI
└── prototypes/
    └── {id}/
        ├── meta.json
        ├── groups/
        │   └── {gid}/
        │       ├── meta.json
        │       └── brief.md   ← group-level brief
        └── versions/
            └── {vid}/
                ├── meta.json
                └── files/     ← snapshot of HTML/CSS/JS files
```



---

## License

MIT