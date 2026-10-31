// Turns "/audio/x.mp3" into a path that also works when the site lives in a sub-folder (GitHub Pages).
// In tests (plain Node) import.meta.env does not exist, so paths stay unchanged.
const base = import.meta.env?.BASE_URL ?? '/';
export const assetUrl = path => (typeof path === 'string' && path.startsWith('/') ? base + path.slice(1) : path);
