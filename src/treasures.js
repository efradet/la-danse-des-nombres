import { PALETTE } from './palette.js';

const KEY = 'la-danse-des-nombres.treasures.v1';
const WARNING = 'Tes peintures restent visibles ici, mais ce navigateur ne peut pas les conserver après fermeture.';

export function makeTreasure(game) {
  if (game.phase !== 'complete' || game.colored.length !== game.artwork.zones.length) return null;
  return { id: game.id, artworkId: game.artwork.id, version: game.artwork.version,
    completedAt: new Date().toISOString(),
    colors: Object.fromEntries(game.artwork.zones.map(zone => [zone.id, PALETTE[zone.number].hex])) };
}

export function loadTreasures(storage, catalog) {
  try {
    const raw = storage.getItem(KEY);
    if (raw === null) return { items: [], error: null };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Invalid collection');
    const seen = new Set();
    const items = parsed.filter(item => {
      if (!item || typeof item.id !== 'string' || !item.id || seen.has(item.id)) return false;
      const art = catalog.find(art => art.id === item.artworkId && art.version === item.version);
      if (!art || typeof item.completedAt !== 'string' || !Number.isFinite(Date.parse(item.completedAt))) return false;
      if (!item.colors || typeof item.colors !== 'object' || Array.isArray(item.colors)) return false;
      if (Object.keys(item.colors).length !== art.zones.length || !art.zones.every(zone => /^#[\da-f]{6}$/i.test(item.colors[zone.id]))) return false;
      seen.add(item.id);
      return true;
    });
    return { items, error: items.length !== parsed.length ? 'Certaines peintures enregistrées étaient illisibles. Les autres ont été conservées.' : null };
  } catch { return { items: [], error: WARNING }; }
}

export function saveTreasure(items, treasure, storage) {
  const next = treasure && !items.some(item => item.id === treasure.id) ? [treasure, ...items] : items;
  try {
    storage.setItem(KEY, JSON.stringify(next));
    return { items: next, error: null };
  } catch { return { items: next, error: WARNING }; }
}
