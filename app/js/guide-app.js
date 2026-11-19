// The guide's wiring: loads the trophies, holds the tracker's state,
// connects the controls (views, search, kind and grade filters, the spoiler
// setting, export and import) and re-renders whenever anything changes.
// A ?shot=<name> address applies a prepared state for taking screenshots.

import { KIND_LABELS, earnedPoints, loadTrophies } from './trophy-data.js';
import { exportProgressToFile, importProgressFromFile, loadEarnedIds, loadSettings, saveEarnedIds, saveSettings } from './tracker-state.js';
import { renderChecklist, renderDetail, renderKindFilters, renderMissables, renderRoadmap } from './render-views.js';

const els = {
  earned: document.getElementById('stat-earned'),
  percent: document.getElementById('stat-percent'),
  points: document.getElementById('stat-points'),
  platinum: document.getElementById('stat-platinum'),
  platinumMeter: document.getElementById('platinum-meter'),
  overallMeter: document.getElementById('overall-meter'),
  list: document.getElementById('trophy-list'),
  detail: document.getElementById('trophy-detail'),
  roadmap: document.getElementById('roadmap-list'),
  missables: document.getElementById('missables-list'),
  missableCount: document.getElementById('missable-count'),
  kindFilters: document.getElementById('kind-filters'),
  search: document.getElementById('search-input'),
  grade: document.getElementById('grade-select'),
  spoiler: document.getElementById('spoiler-checkbox'),
  exportButton: document.getElementById('export-button'),
  importButton: document.getElementById('import-button'),
  importFile: document.getElementById('import-file'),
};

const ui = { view: 'checklist', kind: 'all', grade: 'all', query: '', selectedId: null };
let trophies = [];
let earnedIds = loadEarnedIds();
let settings = loadSettings();

function trophyById(id) {
  return trophies.find((t) => t.id === id) ?? null;
}

function filteredTrophies() {
  const query = ui.query.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (ui.kind === 'missable' && !trophy.missable) return false;
    if (ui.kind !== 'all' && ui.kind !== 'missable' && trophy.kind !== ui.kind) return false;
    if (ui.grade !== 'all' && trophy.grade !== ui.grade) return false;
    if (!query) return true;
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${KIND_LABELS[trophy.kind]}`.toLowerCase();
    return haystack.includes(query);
  });
}

function emptyMessage() {
  if (ui.kind === 'online') {
    return '<p class="empty-note">The official list names no online trophies — all 55 are earned in the single-player game, so this file is empty by design. The filter stays because the list, not the tracker, decides what kinds exist.</p>';
  }
  return '<p class="empty-note">No trophies match that combination. Loosen the search or the filters and the file fills again.</p>';
}

function renderProgress() {
  const total = trophies.length;
  const earnedCount = trophies.filter((t) => earnedIds.has(t.id)).length;
  const nonPlatinum = trophies.filter((t) => t.grade !== 'platinum');
  const towardPlatinum = nonPlatinum.filter((t) => earnedIds.has(t.id)).length;
  els.earned.textContent = `${earnedCount} / ${total}`;
  els.percent.textContent = `${total ? Math.round((earnedCount / total) * 100) : 0}%`;
  els.points.textContent = String(earnedPoints(trophies, earnedIds));
  els.platinum.textContent = `${towardPlatinum} / ${nonPlatinum.length}`;
  els.platinumMeter.style.width = `${nonPlatinum.length ? (towardPlatinum / nonPlatinum.length) * 100 : 0}%`;
  els.overallMeter.style.width = `${total ? (earnedCount / total) * 100 : 0}%`;
  els.missableCount.textContent = `(${trophies.filter((t) => t.missable).length})`;
}

function renderAll() {
  renderProgress();
  renderKindFilters(els.kindFilters, trophies, ui.kind);
  const ctx = { earnedIds, hideSpoilers: settings.hideSpoilers, selectedId: ui.selectedId, emptyMessage: emptyMessage() };
  renderChecklist(els.list, filteredTrophies(), ctx);
  renderDetail(els.detail, trophyById(ui.selectedId), ctx);
  renderRoadmap(els.roadmap, trophies, ctx);
  renderMissables(els.missables, trophies, ctx);
  document.querySelectorAll('.view-tab').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.view === ui.view));
  document.querySelectorAll('.view').forEach((view) => view.classList.toggle('is-active', view.id === `view-${ui.view}`));
  els.spoiler.checked = settings.hideSpoilers;
}

function setEarned(id, on) {
  if (on) earnedIds.add(id); else earnedIds.delete(id);
  saveEarnedIds(earnedIds);
  renderAll();
}

function openTrophy(id) {
  ui.selectedId = id;
  ui.view = 'checklist';
  renderAll();
  const row = els.list.querySelector(`[data-open="${id}"]`);
  if (row) row.scrollIntoView({ block: 'center' });
}

// Prepared states for the maker's screenshots: real progress, real views.
function applyShotPreset(name) {
  const presets = {
    cover: { earned: [2, 3, 4, 8, 16, 21, 35, 44, 53], view: 'checklist', selectedId: 17 },
    roadmap: { earned: [2, 3, 4, 44], view: 'roadmap', selectedId: null },
    missables: { earned: [2, 3], view: 'missables', selectedId: null, hideSpoilers: true },
    guide: { earned: [2, 3, 28, 30, 35], view: 'checklist', selectedId: 31 },
  };
  const preset = presets[name];
  if (!preset) return;
  earnedIds = new Set(preset.earned);
  saveEarnedIds(earnedIds);
  if (preset.hideSpoilers) {
    settings = { hideSpoilers: true };
    saveSettings(settings);
  }
  ui.view = preset.view;
  ui.selectedId = preset.selectedId;
}

function wireControls() {
  document.querySelectorAll('.view-tab').forEach((tab) => {
    tab.addEventListener('click', () => { ui.view = tab.dataset.view; renderAll(); });
  });
  els.kindFilters.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-kind]');
    if (!chip) return;
    ui.kind = chip.dataset.kind;
    ui.view = 'checklist';
    renderAll();
  });
  els.search.addEventListener('input', () => { ui.query = els.search.value; ui.view = 'checklist'; renderAll(); });
  els.grade.addEventListener('change', () => { ui.grade = els.grade.value; renderAll(); });
  els.spoiler.addEventListener('change', () => {
    settings = { hideSpoilers: els.spoiler.checked };
    saveSettings(settings);
    renderAll();
  });
  els.exportButton.addEventListener('click', () => exportProgressToFile(earnedIds));
  els.importButton.addEventListener('click', () => els.importFile.click());
  els.importFile.addEventListener('change', async () => {
    const file = els.importFile.files[0];
    if (!file) return;
    try {
      earnedIds = await importProgressFromFile(file, new Set(trophies.map((t) => t.id)));
      saveEarnedIds(earnedIds);
      renderAll();
    } catch {
      els.detail.innerHTML = '<div class="detail-card"><h2>That file would not import</h2><p>Import expects a progress file this tracker exported — a JSON list of earned trophy ids.</p></div>';
    }
    els.importFile.value = '';
  });
  document.addEventListener('change', (event) => {
    const box = event.target.closest('[data-earn]');
    if (box) setEarned(Number(box.dataset.earn), box.checked);
  });
  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-earn-toggle]');
    if (toggle) {
      const id = Number(toggle.dataset.earnToggle);
      setEarned(id, !earnedIds.has(id));
      return;
    }
    if (event.target.closest('[data-earn]')) return;
    const opener = event.target.closest('[data-open]');
    if (opener) openTrophy(Number(opener.dataset.open));
  });
}

async function boot() {
  try {
    trophies = await loadTrophies();
  } catch {
    els.list.innerHTML = '<p class="empty-note">The trophy data (data/trophies.json) could not be loaded. Serve the app over HTTP — the guide is filed under app/, and its data travels with it.</p>';
    return;
  }
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) applyShotPreset(shot);
  wireControls();
  renderAll();
}

boot();
