import { storage } from '../core/storage.js';
import { runWelcome } from './welcome.js';
import { runMainTUI } from './main.js';

export async function runInteractiveTUI(): Promise<void> {
  const config = await storage.getConfig();

  if (!config) {
    // First-run welcome flow
    const { prototypeId, groupId } = await runWelcome();
    return;
  }

  // Existing project - launch interactive browser
  const protos = await storage.listPrototypes();
  if (protos.length === 0) {
    const { prototypeId, groupId } = await runWelcome();
    return;
  }

  const prototypeId = protos[0].id;
  const groups = await storage.listGroups(prototypeId);
  const groupId = groups.length > 0 ? groups[0].id : '';

  if (!groupId) {
    const group = await storage.createGroup(prototypeId, { name: 'Default' });
    await runMainTUI({ prototypeId, groupId: group.id });
    return;
  }

  await runMainTUI({ prototypeId, groupId });
}
