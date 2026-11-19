// The tracker's memory: which trophies are earned and whether story
// spoilers are hidden. Everything lives in this browser's localStorage;
// export writes the same data to a JSON file the reader keeps, and import
// reads such a file back.

const PROGRESS_KEY = 'leonida-ledger-progress-v1';
const SETTINGS_KEY = 'leonida-ledger-settings-v1';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function loadEarnedIds() {
  const saved = readJson(PROGRESS_KEY, { earned: [] });
  return new Set(Array.isArray(saved.earned) ? saved.earned : []);
}

export function saveEarnedIds(earnedIds) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({ earned: [...earnedIds].sort((a, b) => a - b) }));
}

export function loadSettings() {
  const saved = readJson(SETTINGS_KEY, { hideSpoilers: false });
  return { hideSpoilers: Boolean(saved.hideSpoilers) };
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ hideSpoilers: Boolean(settings.hideSpoilers) }));
}

// Saves the progress file to the reader's downloads as JSON.
export function exportProgressToFile(earnedIds) {
  const payload = {
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    tracker: 'The Leonida Ledger',
    exportedAt: new Date().toISOString(),
    earned: [...earnedIds].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-ledger-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Reads an exported file back. Only ids that name a real trophy are kept,
// so a hand-edited or foreign file cannot corrupt the tracker.
export async function importProgressFromFile(file, validIds) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) throw new Error('no earned list in that file');
  return new Set(list.filter((id) => validIds.has(id)));
}
