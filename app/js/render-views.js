// Renders the three views — checklist with its detail panel, the roadmap
// and the missables file — from the trophy data and the tracker's state.

import { GRADE_LABELS, KIND_LABELS, ROADMAP_STAGES, isSealedSpoiler, stageOf } from './trophy-data.js';

export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function gradeBadge(trophy) {
  return `<span class="grade-badge grade-${trophy.grade}">${GRADE_LABELS[trophy.grade]}</span>`;
}

export function kindTag(trophy) {
  return `<span class="kind-tag kind-${trophy.kind}">${KIND_LABELS[trophy.kind]}</span>`;
}

export function missableStamp(trophy) {
  return trophy.missable ? '<span class="missable-stamp">Missable</span>' : '';
}

export function countChip(trophy) {
  return trophy.countLabel ? `<span class="count-chip">${escapeHtml(trophy.countLabel)}</span>` : '';
}

function rowName(trophy, sealed) {
  return sealed ? '<span class="sealed-name">▓▓ Sealed — story trophy</span>' : escapeHtml(trophy.name);
}

export function renderChecklist(listEl, trophies, ctx) {
  if (trophies.length === 0) {
    listEl.innerHTML = ctx.emptyMessage;
    return;
  }
  listEl.innerHTML = trophies.map((trophy) => {
    const sealed = isSealedSpoiler(trophy, ctx.earnedIds, ctx.hideSpoilers);
    const earned = ctx.earnedIds.has(trophy.id);
    const selected = ctx.selectedId === trophy.id;
    return `<article class="trophy-row${earned ? ' is-earned' : ''}${selected ? ' is-selected' : ''}" data-open="${trophy.id}">
      <label class="earn-box" title="Mark earned">
        <input type="checkbox" data-earn="${trophy.id}" ${earned ? 'checked' : ''}>
      </label>
      <div class="row-main">
        <div class="row-title-line">
          <span class="case-no">Nº ${trophy.id}</span>
          <h3>${rowName(trophy, sealed)}</h3>
          ${gradeBadge(trophy)}${kindTag(trophy)}${missableStamp(trophy)}
        </div>
        <p class="row-desc">${sealed ? 'Description sealed until earned — the spoiler setting is on.' : escapeHtml(trophy.description)}</p>
        <div class="row-meta">${countChip(trophy)}<span class="stage-note">Roadmap stage ${trophy.stage} · ${escapeHtml(stageOf(trophy).title)}</span></div>
      </div>
    </article>`;
  }).join('');
}

export function renderDetail(panelEl, trophy, ctx) {
  if (!trophy) {
    panelEl.innerHTML = `<div class="detail-empty">
      <p class="detail-kicker">Evidence file</p>
      <h2>Pick a trophy</h2>
      <p>Select any row to read its guide here — what the official description asks for, how to approach it, when it can be missed, and the sources each guide cites.</p>
      <p>The checklist saves itself in this browser as you tick trophies off. Export keeps a copy you own; import brings it back.</p>
    </div>`;
    return;
  }
  const sealed = isSealedSpoiler(trophy, ctx.earnedIds, ctx.hideSpoilers);
  const earned = ctx.earnedIds.has(trophy.id);
  if (sealed) {
    panelEl.innerHTML = `<div class="detail-card">
      <p class="detail-kicker">Evidence Nº ${trophy.id} · sealed</p>
      <h2>▓▓ Sealed — story trophy</h2>
      <div class="detail-badges">${gradeBadge(trophy)}${kindTag(trophy)}</div>
      <p class="sealed-note">The spoiler setting is on, so this story trophy's name, description and guide stay hidden until you earn it. Tick it off in the checklist — or turn the setting off — to unseal the file.</p>
      <button type="button" class="earn-toggle" data-earn-toggle="${trophy.id}">Mark as earned</button>
    </div>`;
    return;
  }
  panelEl.innerHTML = `<div class="detail-card">
    <p class="detail-kicker">Evidence Nº ${trophy.id} · Roadmap stage ${trophy.stage} — ${escapeHtml(stageOf(trophy).title)}</p>
    <h2>${escapeHtml(trophy.name)}</h2>
    <div class="detail-badges">${gradeBadge(trophy)}${kindTag(trophy)}${missableStamp(trophy)}${countChip(trophy)}</div>
    <h3 class="detail-heading">Official description</h3>
    <p class="official-desc">“${escapeHtml(trophy.description)}”</p>
    ${trophy.missable ? `<div class="missable-warning"><strong>Missable — read before you play past it.</strong> ${escapeHtml(trophy.missableReason ?? '')}</div>` : ''}
    <h3 class="detail-heading">Guide — in our own words</h3>
    <p class="guide-text">${escapeHtml(trophy.guide)}</p>
    <h3 class="detail-heading">Sources</h3>
    <ul class="source-list">${trophy.sources.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
    <button type="button" class="earn-toggle" data-earn-toggle="${trophy.id}">${earned ? 'Earned ✓ — tap to undo' : 'Mark as earned'}</button>
  </div>`;
}

export function renderRoadmap(roadmapEl, trophies, ctx) {
  roadmapEl.innerHTML = `<p class="view-intro">The road to the platinum, in the order this guide recommends — built from the official descriptions: which chapters and missions, which collectibles and counts, and where the missable moments sit. Work top to bottom and nothing on the list can strand you.</p>` +
    ROADMAP_STAGES.map((stage) => {
      const inStage = trophies.filter((t) => t.stage === stage.stage);
      const done = inStage.filter((t) => ctx.earnedIds.has(t.id)).length;
      const rows = inStage.map((trophy) => {
        const sealed = isSealedSpoiler(trophy, ctx.earnedIds, ctx.hideSpoilers);
        const earned = ctx.earnedIds.has(trophy.id);
        return `<div class="roadmap-row${earned ? ' is-earned' : ''}" data-open="${trophy.id}">
          <span class="roadmap-check">${earned ? '✓' : '○'}</span>
          <span class="roadmap-name">${rowName(trophy, sealed)}</span>
          ${gradeBadge(trophy)}${trophy.missable ? '<span class="missable-stamp">Missable — catch it here</span>' : ''}${countChip(trophy)}
        </div>`;
      }).join('');
      return `<section class="roadmap-stage">
        <h2><span class="stage-no">Stage ${stage.stage}</span> ${escapeHtml(stage.title)} <span class="stage-progress">${done} / ${inStage.length}</span></h2>
        <p class="stage-note-text">${escapeHtml(stage.note)}</p>
        ${rows}
      </section>`;
    }).join('');
}

export function renderMissables(missablesEl, trophies, ctx) {
  const missables = trophies.filter((t) => t.missable);
  const cards = missables.map((trophy) => `<article class="missable-card">
      <div class="row-title-line">
        <span class="case-no">Nº ${trophy.id}</span>
        <h3>${escapeHtml(trophy.name)}</h3>
        ${gradeBadge(trophy)}${missableStamp(trophy)}
      </div>
      <p class="official-desc">“${escapeHtml(trophy.description)}”</p>
      <div class="missable-warning"><strong>Why this can be missed.</strong> ${escapeHtml(trophy.missableReason ?? '')}</div>
      <p class="guide-text">${escapeHtml(trophy.guide)}</p>
      <h4 class="detail-heading">Sources</h4>
      <ul class="source-list">${trophy.sources.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
      <button type="button" class="open-button" data-open="${trophy.id}">Open in the checklist</button>
    </article>`).join('');
  missablesEl.innerHTML = `<p class="view-intro">Every trophy this guide flags as missable — ${missables.length} of the 55. A trophy earns the flag only when its official description names a single event, a beginning-of-game moment or a one-off set-piece; everything else on the list is progression you cannot skip or free-roam you can repeat, so it is deliberately not flagged. ${ctx.hideSpoilers ? 'The spoiler setting is <strong>on</strong>: story trophies stay sealed in the checklist until you earn them.' : 'The spoiler setting is off: story trophies show their names and descriptions.'}</p>${cards}`;
}

export function renderKindFilters(filtersEl, trophies, activeKind) {
  const counts = { all: trophies.length };
  for (const t of trophies) counts[t.kind] = (counts[t.kind] ?? 0) + 1;
  counts.missable = trophies.filter((t) => t.missable).length;
  const labels = { all: 'All', story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', general: 'Free roam' };
  filtersEl.innerHTML = Object.keys(labels).map((kind) =>
    `<button type="button" class="kind-chip${activeKind === kind ? ' is-active' : ''}" data-kind="${kind}">${labels[kind]} <span class="chip-count">${counts[kind] ?? 0}</span></button>`,
  ).join('');
}
