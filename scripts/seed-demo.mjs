import fs from 'fs-extra';
import path from 'node:path';
import { nanoid } from 'nanoid';

const ROOT = '.proto-explorer';

function id() { return nanoid(10); }
function now() { return new Date().toISOString(); }
function ago(days) { return new Date(Date.now() - days * 86400000).toISOString(); }

async function writeProto(proto) {
  const dir = path.join(ROOT, 'prototypes', proto.id);
  await fs.ensureDir(dir);
  await fs.ensureDir(path.join(dir, 'versions'));
  await fs.ensureDir(path.join(dir, 'groups'));
  await fs.writeJson(path.join(dir, 'meta.json'), proto, { spaces: 2 });
}

async function writeGroup(group) {
  const dir = path.join(ROOT, 'prototypes', group.prototypeId, 'groups', group.id);
  await fs.ensureDir(dir);
  await fs.writeJson(path.join(dir, 'meta.json'), group, { spaces: 2 });
}

async function writeVersion(v) {
  const dir = path.join(ROOT, 'prototypes', v.prototypeId, 'versions', v.id);
  await fs.ensureDir(dir);
  await fs.ensureDir(path.join(dir, 'files'));

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${v.name}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;background:#0a0a0f;color:#fff}
.card{max-width:480px;padding:3rem;text-align:center;border-radius:1.5rem;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02)}
h1{font-size:1.8rem;margin-bottom:0.5rem}p{color:#888;font-size:0.95rem;line-height:1.6}
.tag{display:inline-block;margin-top:1rem;padding:0.3rem 0.8rem;border-radius:999px;font-size:0.75rem;background:rgba(109,92,255,0.15);color:rgb(109,92,255)}</style></head>
<body><div class="card"><h1>${v.name}</h1><p>${v.description || ''}</p><div class="tag">${v.category}</div></div></body></html>`;
  await fs.writeFile(path.join(dir, 'files', 'index.html'), html);

  await fs.writeJson(path.join(dir, 'meta.json'), v, { spaces: 2 });
}

async function main() {
  await fs.remove(ROOT);
  await fs.ensureDir(ROOT);
  await fs.writeJson(path.join(ROOT, 'config.json'), {
    version: '0.1.0',
    projectName: 'Demo Project',
    trackedPaths: ['.'],
    defaultAuthor: 'Designer',
  }, { spaces: 2 });

  // ── Landing Page prototype ──
  const lpId = id();
  await writeProto({ id: lpId, name: 'Landing Page', description: 'Main marketing landing page', createdAt: ago(5), updatedAt: ago(0) });

  // Group: Landing Page v1
  const g1Id = id();
  await writeGroup({ id: g1Id, prototypeId: lpId, name: 'Landing Page v1', description: 'Same layout, dark theme with purple accents and glow effects', createdAt: ago(5), updatedAt: ago(1) });

  // Scenarios for v1 — "02 Dark Mode" has 3 sub-versions to test arrows
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g1Id, category: 'Scenarios', name: '01 Gradient Hero', description: 'Bold gradient palette, pill buttons, gradient text', tags: ['bold'], starred: true, author: 'Designer', timestamp: ago(4), fileCount: 1 });

  await writeVersion({ id: id(), prototypeId: lpId, groupId: g1Id, category: 'Scenarios', name: '02 Dark Mode', description: 'First pass — dark bg, white text, basic layout', tags: ['minimalist'], starred: false, author: 'Designer', timestamp: ago(3.5), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g1Id, category: 'Scenarios', name: '02 Dark Mode', description: 'Second pass — added purple accents and glow effects', tags: ['minimalist'], starred: false, author: 'Designer', timestamp: ago(3), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g1Id, category: 'Scenarios', name: '02 Dark Mode', description: 'Final — polished gradients, refined spacing', tags: ['minimalist'], starred: false, author: 'Designer', timestamp: ago(2.5), fileCount: 1 });

  await writeVersion({ id: id(), prototypeId: lpId, groupId: g1Id, category: 'Scenarios', name: '03 Clean White', description: 'Light, airy aesthetic with hero, features, testimonials', tags: ['minimalist'], starred: false, author: 'Designer', timestamp: ago(3), fileCount: 1 });

  // Concepts for v1
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g1Id, category: 'Concepts', name: 'Split Hero', description: 'Two-column hero with image left, text right', tags: ['layout'], starred: false, author: 'Designer', timestamp: ago(2), fileCount: 1 });

  // Variations for v1
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g1Id, category: 'Variations', name: 'CTA Rounded', description: 'Testing rounded CTA buttons with different radius', tags: ['micro'], starred: false, author: 'Designer', timestamp: ago(1), fileCount: 1 });

  // Group: Landing Page v2
  const g2Id = id();
  await writeGroup({ id: g2Id, prototypeId: lpId, name: 'Landing Page v2', description: 'Sketches of the new thing.\nhope you like it.', createdAt: ago(2), updatedAt: ago(0) });

  await writeVersion({ id: id(), prototypeId: lpId, groupId: g2Id, category: 'Scenarios', name: '01 Bento Grid', description: 'Bento-style feature grid with glassmorphism cards', tags: ['modern'], starred: false, author: 'Designer', timestamp: ago(1.5), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g2Id, category: 'Scenarios', name: '02 Scroll Reveal', description: 'Sections animate in on scroll, parallax hero', tags: ['motion'], starred: false, author: 'Designer', timestamp: ago(1.2), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g2Id, category: 'Scenarios', name: '03 Video Hero', description: 'Full-width background video with overlay text', tags: ['media'], starred: false, author: 'Designer', timestamp: ago(1), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g2Id, category: 'Scenarios', name: '04 Minimal Type', description: 'Typography-focused design, large serif headings', tags: ['type'], starred: true, author: 'Designer', timestamp: ago(0.8), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g2Id, category: 'Concepts', name: 'Nav Sticky', description: 'Testing sticky nav with blur backdrop', tags: ['nav'], starred: false, author: 'Designer', timestamp: ago(0.5), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g2Id, category: 'Concepts', name: 'Nav Sticky', description: 'v2 — thinner bar, transparent until scroll', tags: ['nav'], starred: false, author: 'Designer', timestamp: ago(0.45), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g2Id, category: 'Concepts', name: 'Footer CTA', description: 'Large CTA section before footer', tags: ['cta'], starred: false, author: 'Designer', timestamp: ago(0.4), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g2Id, category: 'Concepts', name: 'Footer CTA', description: 'Revised — gradient bg, bigger button', tags: ['cta'], starred: false, author: 'Designer', timestamp: ago(0.35), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g2Id, category: 'Concepts', name: 'Social Proof Bar', description: 'Logo bar with animated marquee', tags: ['social'], starred: false, author: 'Designer', timestamp: ago(0.3), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g2Id, category: 'Variations', name: 'Color Test A', description: 'Purple/blue palette test', tags: ['color'], starred: false, author: 'Designer', timestamp: ago(0.25), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g2Id, category: 'Variations', name: 'Color Test A', description: 'Tweaked — deeper purple, lighter blue accents', tags: ['color'], starred: false, author: 'Designer', timestamp: ago(0.2), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g2Id, category: 'Variations', name: 'Color Test B', description: 'Green/teal palette — first attempt', tags: ['color'], starred: false, author: 'Designer', timestamp: ago(0.15), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g2Id, category: 'Variations', name: 'Color Test B', description: 'Green/teal — warmer tones, gold accent', tags: ['color'], starred: false, author: 'Designer', timestamp: ago(0.1), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g2Id, category: 'Variations', name: 'Color Test B', description: 'Green/teal — final, refined contrast', tags: ['color'], starred: false, author: 'Designer', timestamp: ago(0.05), fileCount: 1 });

  // Group: Initial concepts
  const g3Id = id();
  await writeGroup({ id: g3Id, prototypeId: lpId, name: 'Initial concepts', description: 'Landing page and brand', createdAt: ago(7), updatedAt: ago(5) });

  await writeVersion({ id: id(), prototypeId: lpId, groupId: g3Id, category: 'Scenarios', name: 'Wireframe A', description: 'Basic wireframe with placeholder content', tags: ['wireframe'], starred: false, author: 'Designer', timestamp: ago(7), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g3Id, category: 'Scenarios', name: 'Wireframe B', description: 'Alternative wireframe layout', tags: ['wireframe'], starred: false, author: 'Designer', timestamp: ago(6.5), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: lpId, groupId: g3Id, category: 'Scenarios', name: 'Mood Board', description: 'Visual references and color palette exploration', tags: ['research'], starred: false, author: 'Designer', timestamp: ago(6), fileCount: 1 });

  // ── Dashboard prototype ──
  const dbId = id();
  await writeProto({ id: dbId, name: 'Dashboard', description: 'Analytics dashboard layout', createdAt: ago(4), updatedAt: ago(0) });

  const dg1Id = id();
  await writeGroup({ id: dg1Id, prototypeId: dbId, name: 'Dashboard v1', description: 'Sidebar layout with card widgets', createdAt: ago(4), updatedAt: ago(1) });

  await writeVersion({ id: id(), prototypeId: dbId, groupId: dg1Id, category: 'Scenarios', name: '01 Overview', description: 'Main analytics overview with stats and charts', tags: ['analytics'], starred: true, author: 'Designer', timestamp: ago(4), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: dbId, groupId: dg1Id, category: 'Scenarios', name: '02 Settings', description: 'Settings page with profile and toggles', tags: ['settings'], starred: false, author: 'Designer', timestamp: ago(3), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: dbId, groupId: dg1Id, category: 'Scenarios', name: '03 Team Members', description: 'Team member cards, roles, activity feed', tags: ['team'], starred: false, author: 'Designer', timestamp: ago(2), fileCount: 1 });

  // ── Pricing Page prototype ──
  const ppId = id();
  await writeProto({ id: ppId, name: 'Pricing Page', description: 'Pricing tiers with toggle', createdAt: ago(3), updatedAt: ago(0) });

  const pg1Id = id();
  await writeGroup({ id: pg1Id, prototypeId: ppId, name: 'Pricing v1', description: 'Three tier comparison layout', createdAt: ago(3), updatedAt: ago(1) });

  await writeVersion({ id: id(), prototypeId: ppId, groupId: pg1Id, category: 'Scenarios', name: '01 Dark Theme', description: 'Dark pricing page with 3 tiers and FAQ', tags: ['dark'], starred: false, author: 'Designer', timestamp: ago(3), fileCount: 1 });
  await writeVersion({ id: id(), prototypeId: ppId, groupId: pg1Id, category: 'Scenarios', name: '02 Light Theme', description: 'Clean white pricing with purple accents', tags: ['light'], starred: false, author: 'Designer', timestamp: ago(2), fileCount: 1 });

  console.log('✓ Demo data seeded');
  console.log(`  Landing Page: ${lpId} (3 groups, 17 versions)`);
  console.log(`  Dashboard: ${dbId} (1 group, 3 versions)`);
  console.log(`  Pricing Page: ${ppId} (1 group, 2 versions)`);
}

main().catch(console.error);
