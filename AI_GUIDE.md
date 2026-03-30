# Using Snap with AI tools

You don't need to be a developer to use AI with your prototypes. If you can vibe-code — build things by describing what you want and iterating with AI — you already have the instinct. This guide gives that instinct structure.

Snap gives your prototypes **structure** — names, groups, categories, tags, notes, briefs. Structure is exactly what AI is good at reading. The combination of the two turns a messy folder of HTML files into something you can reason about, hand off, and build on — with or without AI.

---

## The core idea

Your prototypes are already data. Every time you `snap`, you create a named, tagged, categorized record of a design moment. AI can read that record and do useful things with it — organize, compare, name, generate, summarize, critique.

The **export command** is your bridge:

```bash
snap export | pbcopy
```

That one line captures your entire project — context, hierarchy, notes, file listings — and puts it on your clipboard. Paste it into any AI tool and ask whatever you need.

Don't overthink which prompt to use. The structure does the heavy lifting.

---

## Building blocks

These aren't steps in a process. They're tools you combine however the moment calls for.

### Context file

Your project's memory. Lives at `.snap/context.md`.

```bash
# Generate one from your current project structure
snap context generate

# Edit it directly
snap context edit

# View it
snap context
```

Write your goals, audience, brand constraints, design decisions, open questions — anything a teammate (or future-you) would need to pick up the thread. When you run `export`, this context is included automatically.

### Group briefs

Each version group can have a brief — a short description of what that group is exploring.

```bash
# Set a brief
snap brief <group-id> "Exploring bolder typography and dark color palettes"

# View it
snap brief <group-id>
```

Briefs show up in exports. When you ask AI to compare two groups, it reads the briefs and understands the intent behind each one.

### Notes and tags

You already have these. Use them more.

```bash
snap note <version-id> "Stakeholder liked the hero but wanted more contrast"
snap tag <version-id> exploration rejected final
```

Notes become context. Tags become filters. Both make AI responses sharper because they carry intent — not just what the design looks like, but why it exists and where it stands.

### Export

The export command generates a complete, readable summary of your project.

```bash
# Full project as markdown (great for pasting into AI)
snap export

# As structured JSON (better for scripts or precise AI prompts)
snap export --json

# Just one group
snap export --group <id>

# Straight to clipboard
snap export --clipboard
```

---

## Real moments, not abstract workflows

Here's how this plays out in practice. These aren't prescriptive — they're examples of the kind of thinking that works.

### "I have a bunch of files and no structure"

You've been building prototypes in a folder but haven't organized anything yet.

```
snap export
```

Copy the export and paste it into your AI tool:

> Here's my project structure. Suggest how to organize these files into prototypes, version groups, and scenarios. Output the exact commands I should run.

The AI sees your file names, any existing notes, and your context file. It can suggest groupings you might not have thought of.

### "I made changes but can't tell what's different"

You have two versions of the same page and want to understand what changed.

Restore both versions to compare:

```bash
snap restore <version-id-1>
# copy the HTML
snap restore <version-id-2>
```

Paste both into your AI tool:

> Compare these two HTML files. Describe the visual and structural differences as a designer would — focus on layout changes, color shifts, typography updates, and interaction patterns.

### "I have 12 unnamed snapshots"

You've been snapping aggressively but naming lazily.

```bash
snap export --json
```

> Here are my versions with their file contents listed. Suggest meaningful, descriptive names for each based on what they contain. Use the naming style: "01 Hero Section", "02 Dark Mode", etc.

### "I want a dark mode variant"

You have a light version of your dashboard and want to explore dark.

Export the current version, paste the HTML into AI:

> Here's my dashboard HTML/CSS. Generate a dark-mode variant that preserves the layout, components, and interactions. Use a zinc/slate color palette with subtle borders. I'll snap this as a new sub-version.

Then snap the result:

```bash
# paste AI output into your files
snap snap "01 Overview Panel" --category "Variations"
```

### "Stakeholder review time"

You need to present your work to someone who doesn't live in the codebase.

```bash
snap export --clipboard
```

> Summarize this prototype project for a product review meeting. For each version group, highlight: what was explored, key design decisions, what changed between iterations, and open questions. Keep it concise — 2-3 bullet points per group.

### "A teammate is picking this up"

Someone new is joining the project.

First, make sure your context is up to date:

```bash
snap context edit
```

Add anything that's not captured in notes and tags — the *why* behind your decisions, dead ends you've already explored, constraints that aren't obvious.

Then export:

```bash
snap export --clipboard
```

Your teammate can paste this into their AI tool:

> I'm picking up this project from a colleague. Summarize the current state: what's been explored, what worked, what was rejected, and what needs attention next. Point me to the most important versions to look at first.

### "I need UX feedback"

```bash
snap export --group <id> --clipboard
```

> Review this prototype group from a UX perspective. Focus on: navigation patterns, visual hierarchy, accessibility concerns, and mobile responsiveness. Be specific about what works and what could improve.

### "Start from scratch with AI"

You don't have any files yet. Start by describing what you want to your AI tool:

> Generate an HTML page for a SaaS onboarding flow. Step 1: welcome screen with a name input and "Get Started" button. Minimal, dark theme. Use Tailwind CSS classes. No frameworks.

The AI generates the code. Here's the full loop:

1. **Save the output** — paste or write the generated HTML/CSS into your project files
2. **Snap it** — `snap snap "01 Welcome Screen" --category "Concepts"`
3. **Iterate** — ask AI for a variation, save it, snap it again

```bash
snap snap "01 Welcome Screen" --category "Concepts"
```

Now ask for a variation:

> Take this welcome screen and create a version with warmer colors, rounded corners, and illustration placeholders. Keep the same layout and flow.

Save it, snap it with the same name. Now you have two sub-versions of "01 Welcome Screen" you can flip between in the explorer.

### "I want to show my PM three options"

You've been exploring directions and need to present options for a decision.

Snap each direction as a separate entry:

```bash
snap snap "Option A — Minimal" --category "Concepts" --tag pm-review
snap snap "Option B — Bold" --category "Concepts" --tag pm-review
snap snap "Option C — Playful" --category "Concepts" --tag pm-review
```

Open the explorer and share the URL (`localhost:4200`). Your PM can click through each option in the drawer, full-screen, no distractions. You can even add notes to each one explaining the thinking:

```bash
snap note <id> "Minimal approach — fastest to build, closest to current design system"
snap note <id> "Bold direction — higher risk, bigger impact, needs custom illustrations"
snap note <id> "Playful tone — tested well in user interviews but might not fit enterprise"
```

After the meeting, tag the winner:

```bash
snap tag <id> approved
```

---

## Tips

**Write context before you need it.** When you're deep in a prototype, you know why you made every decision. A week later, you won't. Spend two minutes writing it down — `snap context edit` — and your future self (and your AI tools) will be much sharper.

**Tag with intent, not just description.** Tags like `exploration`, `final`, `rejected`, `stakeholder-approved` carry more meaning than `blue` or `round-corners`. When AI reads your export, intent tags help it understand which versions matter and which were dead ends.

**Briefs before comparisons.** Before asking AI to compare two version groups, write a brief for each one. "This group explores minimal typography" vs. "This group explores bold gradients" gives AI the framing to make meaningful comparisons instead of just listing visual differences.

**The export is your universal adapter.** ChatGPT, Claude, Cursor, Copilot — they all read markdown. Run `snap export`, paste it, and ask. The structure is the same regardless of which tool you're using.

**Don't be rigid about it.** There's no "correct" workflow. Some days you'll use AI to generate variants. Other days you'll use it to name things. Sometimes you'll just export your project and ask "what am I missing?" The point is that your prototypes are structured, your context is written, and AI can read both.

---

## Quick reference

| Command | What it does |
|---------|-------------|
| `snap context` | View project context |
| `snap context edit` | Edit context in your editor |
| `snap context generate` | Auto-generate context from project structure |
| `snap brief <group-id> "text"` | Set a group brief |
| `snap export` | Export full project as markdown |
| `snap export --json` | Export as structured JSON |
| `snap export --clipboard` | Export straight to clipboard |
| `snap export --group <id>` | Export a single group |
| `snap note <id> "text"` | Add a note to a version |
| `snap tag <id> tags...` | Tag a version with intent |
