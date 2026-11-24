'use strict';
function previewNotes(item) {
  const notes = item.flatNotes?.length ? item.flatNotes : [...(item.topNotes || []), ...(item.heartNotes || []), ...(item.baseNotes || [])];
  return [...new Set(notes.map(note => String(note).trim()).filter(Boolean))];
}
function renderNotePreview(item) {
  const notes = previewNotes(item);
  if (!notes.length) return '';
  return `<div class="note-preview" aria-label="Izbor upisanih mirisnih nota">${notes.slice(0, 3).map(note => `<span>${escapeHtml(note)}</span>`).join('')}${notes.length > 3 ? `<span class="note-more" aria-label="Još ${notes.length - 3} nota u detaljima">+${notes.length - 3}</span>` : ''}</div>`;
}
function renderFillLevel(item) {
  const ml = Number(item.ml), capacity = Number(item.capacity);
  if (item.kind !== 'bottle' || item.ownership !== 'owned' || item.ml == null || !Number.isFinite(ml) || !Number.isFinite(capacity) || capacity <= 0 || ml < 0 || ml > capacity) return '';
  const percent = Math.round(ml / capacity * 100);
  return `<div class="fill-level"><div class="fill-caption"><span>Preostalo u bočici</span><span>${percent}%</span></div><meter min="0" max="${capacity}" value="${ml}" aria-label="Preostalo ${fmt(ml)} od ${fmt(capacity)} ml">${percent}%</meter></div>`;
}
function renderFamilyFilters() {
  const counts = new Map();
  active().forEach(item => { if (item.family) counts.set(item.family, (counts.get(item.family) || 0) + 1); });
  const choices = [['', active().length], ...[...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'hr'))];
  const container = document.getElementById('familyFilters');
  const markup = choices.map(([family, count]) => `<button type="button" class="family-chip" data-family="${escapeHtml(family)}" aria-pressed="${filterFamily === family}">${escapeHtml(family || 'Sve skupine')} <span>${count}</span></button>`).join('');
  if (container.innerHTML !== markup) container.innerHTML = markup;
  document.getElementById('clearFiltersBtn').hidden = !search && !filterFamily && !offersOnly;
}
function setupPresentation() {
  const cards = document.getElementById('cards');
  const buttons = [...document.querySelectorAll('[data-layout]')];
  function setLayout(value) {
    const layout = value === 'list' ? 'list' : 'grid';
    cards.classList.toggle('cards-list', layout === 'list');
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.layout === layout)));
    try { localStorage.setItem('mirisni-arhiv-layout', layout); } catch {}
  }
  let savedLayout = 'grid';
  try { savedLayout = localStorage.getItem('mirisni-arhiv-layout') || 'grid'; } catch {}
  setLayout(savedLayout);
  buttons.forEach(button => button.addEventListener('click', () => setLayout(button.dataset.layout)));
  document.getElementById('familyFilters').addEventListener('click', event => {
    const button = event.target.closest('[data-family]');
    if (!button) return;
    filterFamily = button.dataset.family;
    renderCards();
    const selected = [...document.querySelectorAll('[data-family]')].find(button => button.dataset.family === filterFamily);
    selected?.focus({preventScroll: true});
  });
  document.getElementById('clearFiltersBtn').addEventListener('click', resetFilters);
}
