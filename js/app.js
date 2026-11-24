'use strict';
const ICONS = {
  bottle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 2h6v4H9zm-2 4h10l1 3v12H6V9z"/></svg>',
  vial: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 2h6v4H9zm-2 4h10M9 6v15h6V6"/></svg>',
  history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11a9 9 0 1 0 3-7M3 3v7h7M12 7v5l3 2"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.7 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.7 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v14m-5-5 5 5 5-5M4 18v4h16v-4"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4 17 12-12 3 3L7 20H4zM14 7l3 3"/></svg>',
  import: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v15m-5-5 5 5 5-5M4 20h16"/></svg>'
};
const KEY = 'mirisniArhiv_v7_20261115';
const V4_KEY = 'mirisniArhiv_v4_20261112';
const V3_KEY = 'mirisniArhiv_v3_20261112';
const PREVIOUS_KEY = 'mirisniArhiv_v2_20261112';
const OLD_KEY = 'mirisniArhiv_v1_20261112';
const ownershipLabels = {owned: 'Imam', past: 'Arhiva', wish: 'Želim'};
const tabInfo = {
  bottles: {nav: 'navB', hash: 'imam', heading: 'Moji parfemi', kicker: 'AKTIVNA KOLEKCIJA', hero: 'Moji parfemi', desc: 'Bočice u kolekciji, količine i mirisne note.', helper: 'Količine bez potvrde ostaju prazne. Cijene dekanta su iz tvoje evidencije, a procjene bočica su orijentacijske.'},
  testers: {nav: 'navT', hash: 'testeri', heading: 'Moji testeri', kicker: 'UZORCI I DEKANTI', hero: 'Testeri', desc: 'Mirisi koje isprobavam i količine uzoraka.', helper: 'Ovdje su samo testeri koje još imaš. Ako potrošiš uzorak, prebaci ga u „Arhiva mirisa”.'},
  past: {nav: 'navH', hash: 'imao', heading: 'Arhiva mirisa', kicker: 'PRIJAŠNJI MIRISI', hero: 'Arhiva mirisa', desc: 'Prodani, potrošeni i zamijenjeni parfemi i testeri, sa sačuvanim podacima.', helper: 'Promijeni status na „Imam” ako isti miris ponovno dođe u kolekciju.'},
  wish: {nav: 'navW', hash: 'zelim', heading: 'Lista želja', kicker: 'ZA ISPROBATI I NABAVITI', hero: 'Lista želja', desc: 'Parfemi koje želim isprobati ili dodati kolekciji.', helper: 'Na listi želja možeš upisati ciljani budžet. Kad nešto nabaviš, jednim klikom prebaci u „Imam”.'}
};
const familyColors = {'Voćni': '214,145,126', 'Gourmand': '218,170,103', 'Drvenasti': '136,169,134', 'Mošusni': '159,164,194', 'Svježi': '117,178,184', 'Citrusni': '203,185,108', 'Začinski': '180,124,101', 'Morski': '109,173,193', 'Kožnati': '176,128,96', 'Aromatični': '147,174,132', 'Cvjetni': '196,151,165', 'Eksperimentalni': '159,130,170', 'Mineralni': '138,163,169', 'Zeleni': '136,179,132', 'Puderasti': '189,178,164', 'Tropski': '203,161,105', 'Čajni': '146,175,144', 'Nepoznato': '145,160,158'};
const statuses = ['U kolekciji', 'Prodaja/zamjena'];
const families = Object.keys(familyColors);
const UPDATED_RECORDS = new Set(["b001", "b002", "b003", "b004", "b005", "b006", "b007", "b009", "b010", "b011", "b012", "b013", "b014", "b015", "b016", "b017", "b018", "b019", "b020", "b021", "b022", "b023", "b024", "b025", "b026", "b027", "b028", "b029", "b030", "b032", "b033", "b034", "b035", "b036", "b039", "b040", "b041", "b042", "b043", "b044", "b045", "b046", "h017", "t002", "t003", "t004", "t017", "t018", "t019", "t020", "t021", "t022", "t023", "t024", "t025", "t026", "t027", "t054", "t055", "t059", "t060"]);
const initial = structuredClone(SEED_DATA);
initial.deletedIds = Array.isArray(initial.deletedIds) ? initial.deletedIds : [];
let isAdmin = false;
let db = null;
let connected = false;
let remoteVersion = null;
let ownerCheckInProgress = false;
let catalog = clone(initial), tab = tabFromHash(), search = '', filterFamily = '', sortBy = 'default', toastTimeout = null;
let offersOnly = false;

let searchDebounce = null;
let searchIndex = new WeakMap();
function saleStatus(item) {
  if (item.kind !== 'bottle' || item.ownership !== 'owned') return '';
  return ['Za prodaju', 'Za zamjenu', 'Moguća zamjena', 'Prodaja/zamjena'].includes(item.status) ? 'Prodaja/zamjena' : '';
}
function setAutomaticTrade(item, oldItem = null) {
  if (item.kind !== 'bottle' || item.ownership !== 'owned') return;
  const current = Number(item.personalRating);
  if (item.personalRating != null && Number.isFinite(current) && current <= 7) {
    item.status = 'Prodaja/zamjena';
    item.autoTrade = true;
  } else if (oldItem?.autoTrade && ['Prodaja/zamjena','Za zamjenu'].includes(item.status)) {
    item.status = 'U kolekciji';
    item.autoTrade = false;
  }
}
function normalizeSearch(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('hr').trim();
}

function escapeHtml(v) {return String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));}
function fmt(n) {return Number(n).toLocaleString('hr-HR', {maximumFractionDigits: 2});}
function euro(n) {return n == null || n === '' ? '—' : fmt(n) + ' €';}
function numOrNull(v) {if (v == null || String(v).trim() === '') return null; const n = Number(String(v).replace(',', '.')); return Number.isFinite(n) ? n : null;}
function safeUrl(url) {const s = String(url || '').trim(); return /^(https:\/\/|assets\/|\.\/assets\/|images\/|\.\/images\/|data:image\/(jpeg|png|webp);base64,)/i.test(s) ? s : '';}
function renderImage(item) {let src = safeUrl(item.image); if (src) return `<div class="bottle-art" aria-hidden="true"><span>✦</span></div><img class="perfume-image" loading="lazy" decoding="async" width="340" height="260" src="${escapeHtml(src)}" alt="${escapeHtml(item.brand + ' ' + item.name)}" onerror="this.closest('.art').classList.remove('has-image');this.remove()">`; return `<div class="bottle-art" aria-hidden="true"><span>✦</span></div>`;}
function clone(obj) {return structuredClone(obj);}
function normalizeItem(i, seed) {const j = fillFragranticaGaps({...seed, ...i}); j.ownership = ['owned', 'past', 'wish'].includes(j.ownership) ? j.ownership : 'owned'; j.image = Object.prototype.hasOwnProperty.call(i, 'image') ? safeUrl(i.image) : (safeUrl(seed?.image) || ''); j.count = Math.max(1, Number(j.count) || 1); return j;}
function mergeCatalog(input, previous = false) {
  const base = clone(initial);
  const deleted = new Set(Array.isArray(input?.deletedIds) ? input.deletedIds.filter(x => typeof x === 'string') : []);
  base.deletedIds = [...deleted];
  if (!input || !Array.isArray(input.bottles) || !Array.isArray(input.testers)) return base;

  for (const key of ['bottles', 'testers']) {
    const defaults = new Map(base[key].map(item => [item.id, item]));
    const seen = new Set();
    const merged = [];

    for (const item of input[key]) {
      if (!item || typeof item !== 'object' || typeof item.id !== 'string') continue;
      if (seen.has(item.id) || deleted.has(item.id) || ['t049', 't053', 'h009', 'b008', 'b037', 'b038', 'b031', 't070', 't051', 't040', 't023', 't015', 't006'].includes(item.id)) continue;
      seen.add(item.id);

      const seed = defaults.get(item.id) || {};
      const updated = normalizeItem(item, seed);
      if (previous && !safeUrl(updated.image) && safeUrl(seed.image)) updated.image = seed.image;
      if (previous && UPDATED_RECORDS.has(item.id)) { updated.ml = seed.ml; updated.ownership = seed.ownership; updated.status = seed.status; updated.capacity = seed.capacity; updated.review = seed.review || updated.review; }

      if (previous && ['b008', 'b037', 'b038'].includes(item.id)) {
        updated.ownership = 'past';
        updated.status = 'Imao';
      }
      merged.push(updated);
    }

    for (const seed of base[key]) {
      if (!seen.has(seed.id) && !deleted.has(seed.id)) merged.push(seed);
    }
    base[key] = merged;
  }

  return base;
}

function readData() {
  return clone(initial);
}

async function persist() {
  if (!isAdmin || !db || !connected) return false;
  try {
    const { error } = await db.from('catalog_state').upsert({id: 1, data: catalog, updated_at: new Date().toISOString()}, {onConflict:'id'});
    if (error) throw error;
    localStorage.setItem(KEY, JSON.stringify(catalog));
    document.querySelector('#storageNotice').classList.remove('show');
    return true;
  } catch (err) {
    document.querySelector('#storageNotice').textContent = 'Online spremanje nije uspjelo: ' + (err.message || err);
    document.querySelector('#storageNotice').classList.add('show');
    return false;
  }
}
function all() {return [...catalog.bottles, ...catalog.testers];}
function active() {if (tab === 'bottles') return catalog.bottles.filter(x => x.ownership === 'owned'); if (tab === 'testers') return catalog.testers.filter(x => x.ownership === 'owned'); return all().filter(x => x.ownership === (tab === 'past' ? 'past' : 'wish'));}
function tabFromHash() {let hash = location.hash.slice(1).toLowerCase(); return Object.keys(tabInfo).find(k => tabInfo[k].hash === hash) || (hash === 'parfemi' ? 'bottles' : 'bottles');}
function fragUrl(i) {if (i.frUrl && /^https:\/\//.test(i.frUrl)) return i.frUrl; return 'https://www.google.com/search?q=' + encodeURIComponent('site:fragrantica.com/perfume/ ' + i.brand + ' ' + i.name);}
function amMl(i) {if (i.ml == null) return 'Količina nije upisana'; if (i.kind === 'tester') return fmt(i.ml) + ' ml' + (i.count > 1 ? ' × ' + i.count : ''); return i.capacity ? fmt(i.ml) + '/' + fmt(i.capacity) + ' ml' : '~ ' + fmt(i.ml) + ' ml';}
function suggested(item) {
  if (item.ownership === 'wish') {
    return {value: item.targetPrice == null ? '—' : euro(item.targetPrice), label: 'Ciljana cijena'};
  }
  if (item.salePrice != null) return {value: euro(item.salePrice), label: 'Tvoja prodajna cijena'};
  if (item.saleRange) return {value: item.saleRange, label: 'Okvirna procjena'};
  return {value: '—', label: 'Nije procijenjeno'};
}

function options(arr, defaultText) {return '<option value="">' + escapeHtml(defaultText) + '</option>' + arr.map(x => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');}
function statData() {
  const data = active(), bottles = data.filter(x => x.kind === 'bottle'), testers = data.filter(x => x.kind === 'tester');
  if (tab === 'bottles') return [['Bočice koje imam', data.length, 'trenutno u kolekciji'], ['Ukupno poznatih ml', fmt(data.reduce((n, x) => n + (x.ml || 0), 0)), 'nepoznate količine nisu uključene']];
  if (tab === 'testers') return [['Različitih uzoraka', data.length, `${data.reduce((n, x) => n + (x.count || 1), 0)} fizičkih testera`], ['Vrste mirisa', new Set(data.map(x => x.family)).size, 'mirisnih skupina'], ['Poznate količine', data.filter(x => x.ml != null).length, 'upisanih stanja'], ['Poznato ml', fmt(data.reduce((n, x) => n + (x.ml || 0) * (x.count || 1), 0)), 'ostalo nije potvrđeno']];
  if (tab === 'past') return [['U povijesti', data.length, 'mirisa ukupno'], ['Bočice', bottles.length, 'više ih nemaš'], ['Testeri', testers.length, 'potrošeni ili uklonjeni'], ['Mirisne skupine', new Set(data.map(x => x.family)).size, 'različitih skupina']];
  return [['Lista želja', data.length, 'mirisa koje razmatraš'], ['Bočice', bottles.length, 'koje želiš nabaviti'], ['Testeri', testers.length, 'koje želiš isprobati'], ['Ciljana cijena', euro(bottles.reduce((n, x) => n + (x.targetPrice || 0), 0)), 'ukupno upisanih budžeta']];
}
function render() {
  searchIndex = new WeakMap();
  const ownedB = catalog.bottles.filter(x => x.ownership === 'owned').length, ownedT = catalog.testers.filter(x => x.ownership === 'owned').length;
  const past = all().filter(x => x.ownership === 'past').length, wish = all().filter(x => x.ownership === 'wish').length;
  for (const [id, val] of Object.entries({bcount: ownedB, tcount: ownedT, hcount: past, wcount: wish})) document.getElementById(id).textContent = val;
  document.querySelector('#stats') && (document.querySelector('#stats').innerHTML = statData().map(([label, note, sub]) => `<div class="stat"><div class="slabel">${escapeHtml(label)}</div><div class="snumber">${escapeHtml(note)}</div><div class="ssub">${escapeHtml(sub)}</div></div>`).join(''));
  renderCards();
}
function compareOptionalNumbers(a, b, direction) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return direction === 'asc' ? a - b : b - a;
}
function renderCards() {
  renderFamilyFilters();
  let data = active().filter(x => {
    let term = searchIndex.get(x);
    if (term == null) {
      term = normalizeSearch([x.brand, x.name, x.description, x.review, x.family, x.category, x.status, ...(x.flatNotes || []), ...(x.topNotes || []), ...(x.heartNotes || []), ...(x.baseNotes || [])].join(' '));
      searchIndex.set(x, term);
    }
    return (!search || term.includes(search)) && (!filterFamily || x.family === filterFamily) && (!offersOnly || (tab === 'bottles' && x.kind === 'bottle' && x.ownership === 'owned' && Boolean(saleStatus(x))));
  });
  const sorters = {
    'name-asc': (a, b) => (a.brand + ' ' + a.name).localeCompare(b.brand + ' ' + b.name, 'hr'),
    'name-desc': (a, b) => (b.brand + ' ' + b.name).localeCompare(a.brand + ' ' + a.name, 'hr'),
    'fr-desc': (a, b) => compareOptionalNumbers(a.frRating, b.frRating, 'desc'),
    'fr-asc': (a, b) => compareOptionalNumbers(a.frRating, b.frRating, 'asc'),
    'personal-desc': (a, b) => compareOptionalNumbers(a.personalRating, b.personalRating, 'desc'),
    'personal-asc': (a, b) => compareOptionalNumbers(a.personalRating, b.personalRating, 'asc'),
    'ml-desc': (a, b) => compareOptionalNumbers(a.ml, b.ml, 'desc'),
    'ml-asc': (a, b) => compareOptionalNumbers(a.ml, b.ml, 'asc')
  };
  if (sorters[sortBy]) data.sort(sorters[sortBy]);
  document.querySelector('#shownCount').textContent = `${data.length} od ${active().length} mirisa u ovom dijelu kolekcije`;
  const summary = document.getElementById('inventorySummary');
  if (summary) {
    const rows = active();
    const known = rows.filter(x => Number.isFinite(Number(x.ml)) && x.ml != null);
    const total = known.reduce((sum,x) => sum + Number(x.ml) * (x.kind === 'tester' ? (Number(x.count) || 1) : 1),0);
    summary.textContent = `${rows.length} mirisa · ${fmt(total)} ml (${fmt(total/1000)} L) ukupno poznate količine`;
  }

  const el = document.querySelector('#cards');
  if (!data.length) {el.innerHTML = '<div class="empty"><b>Nema mirisa za ove filtre.</b><span>Probaj drugi naziv, notu ili mirisnu skupinu.</span><button type="button" class="btn" id="emptyReset">Prikaži sve</button></div>'; return;}
  el.innerHTML = data.map(i => {
    const isBottle = i.kind === 'bottle', src = safeUrl(i.image), rating = isAdmin && i.personalRating != null ? fmt(i.personalRating) : 'Nije upisana', fRating = i.frRating == null ? '—' : fmt(i.frRating);
    const isOwned = i.ownership === 'owned', offerStatus = saleStatus(i), offer = `<div class="info-footer">${offerStatus ? `<span class="availability-tag">${escapeHtml(offerStatus)}</span>` : ''}<button class="editlink admin-only" type="button" data-edit="${escapeHtml(i.id)}">${ICONS.edit} Uredi</button><button class="editlink admin-only" type="button" data-delete="${escapeHtml(i.id)}">Obriši</button></div>`;
    const hasPrices = isBottle && isOwned && [i.price2,i.price5,i.price10].some(v=>v!=null);
    const prices = hasPrices ? `<div class="meta decant-prices">${i.price2!=null ? `<span class="pill dim">2 ml · ${euro(i.price2)}</span>` : ''}${i.price5!=null ? `<span class="pill dim">5 ml · ${euro(i.price5)}</span>` : ''}${i.price10!=null ? `<span class="pill dim">10 ml · ${euro(i.price10)}</span>` : ''}</div>` : (i.kind==='tester' && isOwned && i.samplePrice!=null ? `<div class="meta decant-prices"><span class="pill dim">Tvornički uzorak · ${euro(i.samplePrice)}</span></div>` : '');
    return `<article class="card" style="--rgb:${familyColors[i.family] || '155,160,155'}">
   <div class="art ${src ? 'has-image' : ''}"><button type="button" class="image-open" data-detail="${escapeHtml(i.id)}" aria-label="Otvori fotografiju i detalje: ${escapeHtml(i.brand + ' ' + i.name)}">${renderImage(i)}</button><span class="art-tag">${escapeHtml(i.category || 'Miris')}</span>${!isOwned ? `<span class="badge-own">${escapeHtml(ownershipLabels[i.ownership])}</span>` : ''}</div>
   <div class="card-content"><div class="brand">${escapeHtml(i.brand)}</div><h2 class="card-title"><button type="button" class="detail-open" data-detail="${escapeHtml(i.id)}" aria-label="Detalji: ${escapeHtml(i.brand + ' ' + i.name)}">${escapeHtml(i.name)}</button></h2><p class="card-desc">${escapeHtml(i.description || 'Opis još nije upisan.')}</p>${renderNotePreview(i)}
   ${i.flatNotes?.length ? `<details class="notes-panel"><summary>${i.notesSourceType === 'manufacturer' ? 'Mirisne note · proizvođač' : i.notesVerified === false ? 'Mirisne note' : 'Mirisne note · Fragrantica'}</summary><p>${escapeHtml(i.flatNotes.join(', '))}</p></details>` : (i.topNotes?.length || i.heartNotes?.length || i.baseNotes?.length) ? `<details class="notes-panel"><summary>${i.notesSourceType === 'manufacturer' ? 'Mirisne note · proizvođač' : i.notesVerified === false ? 'Mirisne note' : 'Mirisne note · Fragrantica'}</summary>${i.topNotes?.length ? `<p><b>Gornje:</b> ${escapeHtml(i.topNotes.join(', '))}</p>` : ''}${i.heartNotes?.length ? `<p><b>Srednje:</b> ${escapeHtml(i.heartNotes.join(', '))}</p>` : ''}${i.baseNotes?.length ? `<p><b>Bazne:</b> ${escapeHtml(i.baseNotes.join(', '))}</p>` : ''}</details>` : ''}
   <div class="meta"><span class="pill gold">${escapeHtml(amMl(i))}</span><span class="pill">${escapeHtml(i.family || 'Nepoznato')}</span></div>${renderFillLevel(i)}
   <div class="ratings"><a class="ratingbox" href="${escapeHtml(fragUrl(i))}" target="_blank" rel="noopener noreferrer" title="Fragrantica (otvara profil ili pretragu)"><small>Fragrantica ↗</small><strong class="goldtxt">${fRating} <em>/ 5</em></strong></a>
   <div class="ratingbox admin-only"><small>Moja ocjena</small><strong>${rating} <em>/ 10</em></strong></div></div>
   ${prices}<button type="button" class="detail-view-btn" data-detail="${escapeHtml(i.id)}">Pogledaj detalje</button>${offer}
   <div class="move-row admin-only"><label for="move-${escapeHtml(i.id)}">Premjesti u</label><select class="move-select" id="move-${escapeHtml(i.id)}" aria-label="Premjesti ${escapeHtml(i.name)}" data-move="${escapeHtml(i.id)}"><option value="owned" ${i.ownership === 'owned' ? 'selected' : ''}>Imam</option><option value="past" ${i.ownership === 'past' ? 'selected' : ''}>Arhiva</option><option value="wish" ${i.ownership === 'wish' ? 'selected' : ''}>Želim</option></select>
   ${i.kind === 'tester' ? `<button class="editlink admin-only" type="button" data-rate="${escapeHtml(i.id)}">Ocijeni 0–10</button>` : '<span class="sub" style="font-size:10px;color:#80968a">Spremi promjenu</span>'}</div>
   </div></article>`;
  }).join('');

}

function updateOfferToggle() {
  const bar = document.getElementById('offerViewBar');
  const btn = document.getElementById('offerToggle');
  if (!bar || !btn) return;
  bar.hidden = tab !== 'bottles';
  btn.setAttribute('aria-pressed', String(offersOnly));
  btn.textContent = offersOnly ? 'Prikaži sve parfeme' : 'Prodaja/zamjena';
}
let currentDetailId = null;
function openDetails(id) {
  currentDetailId = id;
  const item = all().find(x => x.id === id);
  if (!item) return;
  const notes = item.flatNotes?.length ? [['Mirisne note', item.flatNotes]] : [['Gornje note',item.topNotes],['Srednje note',item.heartNotes],['Bazne note',item.baseNotes]].filter(([,v]) => v?.length);
  const noteHtml = notes.length ? notes.map(([title, values]) => `<section class="detail-note-group"><h4>${escapeHtml(title)}</h4><div class="detail-tags">${values.map(n => `<span>${escapeHtml(n)}</span>`).join('')}</div></section>`).join('') : '<p class="detail-muted">Mirisne note nisu upisane.</p>';
  const prices = item.kind === 'bottle' && [item.price2,item.price5,item.price10].some(v => v != null) ? `<div class="detail-prices">${[[2,item.price2],[5,item.price5],[10,item.price10]].filter(([,v])=>v!=null).map(([ml,v])=>`<span>${ml} ml <strong>${euro(v)}</strong></span>`).join('')}</div>` : item.samplePrice != null ? `<div class="detail-prices"><span>Uzorak <strong>${euro(item.samplePrice)}</strong></span></div>` : '';
  const image = safeUrl(item.image) ? `<img src="${escapeHtml(safeUrl(item.image))}" alt="${escapeHtml(item.brand+' '+item.name)}" loading="eager">` : '<span class="detail-placeholder">M / A</span>';
  document.querySelector('#detailBody').innerHTML = `<div class="detail-layout"><div class="detail-visual"><div class="detail-image">${image}</div>${renderFillLevel(item)}</div><div class="detail-information"><div class="detail-brand">${escapeHtml(item.brand)}</div><h2 id="detailTitle">${escapeHtml(item.name)}</h2><p class="detail-description">${escapeHtml(item.description || 'Opis još nije upisan.')}</p><div class="detail-facts"><div><small>Količina</small><strong>${escapeHtml(amMl(item))}</strong></div><div><small>Fragrantica</small><strong>${item.frRating == null ? '—' : fmt(item.frRating)+' / 5'}</strong></div>${isAdmin ? `<div><small>Moja ocjena</small><strong>${item.personalRating == null ? 'Nije upisana' : fmt(item.personalRating)+' / 10'}</strong></div>` : ''}<div><small>Skupina</small><strong>${escapeHtml(item.family || '—')}</strong></div></div>${item.frFamily ? `<p class="detail-muted">Fragrantica klasifikacija: ${escapeHtml(item.frFamily)}</p>` : ''}<h3 class="detail-section-title">Mirisne note</h3>${noteHtml}${item.notesVerified === false && item.notesSource ? `<p class="detail-muted">Izvor nota: ${escapeHtml(item.notesSource)}</p>` : ''}${item.frNote && item.notesVerified === false ? `<p class="detail-muted">${escapeHtml(item.frNote)}</p>` : ''}${item.frEnrichment ? `<p class="detail-muted">Dopuna prema Fragrantici · ${escapeHtml(item.frEnrichment.checkedAt)}</p>` : ''}${prices}${item.review ? `<div class="detail-review"><h3>Moja bilješka</h3><p>${escapeHtml(item.review)}</p></div>` : ''}<a class="detail-frag-link" href="${escapeHtml(fragUrl(item))}" target="_blank" rel="noopener noreferrer">Otvori na Fragrantici</a></div></div>`;
  const overlay = document.getElementById('detailOverlay');
  overlay.classList.add('visible'); overlay.setAttribute('aria-hidden','false');
  document.body.classList.add('detail-opened');
  CatalogUI.open(overlay, document.getElementById('detailClose'));
}
function closeDetails() {
  const overlay = document.getElementById('detailOverlay');
  if (!overlay || !overlay.classList.contains('visible')) return;
  overlay.classList.remove('visible'); overlay.setAttribute('aria-hidden','true');
  document.body.classList.remove('detail-opened');
  currentDetailId = null;
  CatalogUI.close(overlay);
}

function perfumeLink(item) {
  const url = new URL(window.location.href);
  url.hash = tabInfo[item.ownership === 'past' ? 'past' : item.ownership === 'wish' ? 'wish' : item.kind === 'tester' ? 'testers' : 'bottles'].hash;
  url.searchParams.set('parfem',item.id);
  return url.toString();
}
async function clipboardCopy(value) {
  try {await navigator.clipboard.writeText(value);} catch(e) {
    const field=document.createElement('textarea');field.value=value;field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();document.execCommand('copy');field.remove();
  }
}
async function shareCurrentPerfume() {
  const item=all().find(x=>x.id===currentDetailId);
  if(!item)return;
  await clipboardCopy(perfumeLink(item));toast('Poveznica na parfem kopirana');
}
async function copyOffers() {
  const available = catalog.bottles
    .filter(item => item.ownership === 'owned' && saleStatus(item))
    .sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, 'hr'));
  if (!available.length) {
    toast('Trenutno nema parfema za prodaju ili zamjenu');
    return;
  }
  const displayAmount = item => item.ml == null ? 'količina na upit' : `${fmt(item.ml)} ml`;
  const lines = [
    'PARFEMI ZA PRODAJU/ZAMJENU',
    '',
    ...available.map(item => `• ${item.brand} ${item.name} — ${displayAmount(item)}`),
    '',
    'Cijene i detalji na upit.'
  ];
  try {
    await clipboardCopy(lines.join('\n'));
    toast(`Kopirano ${available.length} parfema — zalijepi u WhatsApp ili Facebook`);
  } catch (error) {
    console.error('Kopiranje nije uspjelo', error);
    toast('Kopiranje nije uspjelo. Provjeri dopuštenja preglednika.');
  }
}

function openSharedPerfume() {
  const id=new URLSearchParams(location.search).get('parfem');
  if(!id)return;
  const item=all().find(x=>x.id===id);
  if(item){const target=item.ownership==='past'?'past':item.ownership==='wish'?'wish':item.kind==='tester'?'testers':'bottles';if(tab!==target)switchTab(target);openDetails(id);}
}
function resetFilters() {
  clearTimeout(searchDebounce);
  search = ''; filterFamily = ''; sortBy = 'default'; offersOnly = false;  updateOfferToggle();
  document.querySelector('#searchInput').value = '';

  document.querySelector('#sortFilter').value = 'default';
  renderCards();
}
function discoverRandom() {
  const list = active();
  if (!list.length) {toast('Ovaj dio kolekcije zasad je prazan'); return;}
  const selected = list[Math.floor(Math.random() * list.length)];
  resetFilters();
  search = normalizeSearch(selected.brand + ' ' + selected.name);
  document.querySelector('#searchInput').value = selected.brand + ' ' + selected.name;
  renderCards();
  document.querySelector('#cards').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
}
async function moveItem(id, newOwnership) {
  if (!isAdmin) return;
  if (!ownershipLabels[newOwnership]) return; const i = all().find(x => x.id === id); if (!i) return;
  i.ownership = newOwnership; if (newOwnership === 'past') i.status = 'Imao'; else if (newOwnership === 'wish') i.status = 'Želim'; else if (['Imao', 'Želim'].includes(i.status)) i.status = i.kind === 'tester' ? 'Za isprobati' : 'U kolekciji';
  if (await persist()) {render(); toast(`${i.name}: ${ownershipLabels[newOwnership]}`);} else {await refreshCatalog(); render();}
}
function switchTab(next, updateHash = true) {
  if (!tabInfo[next]) return; tab = next; const info = tabInfo[tab]; if (updateHash && location.hash !== '#' + info.hash) history.replaceState(null, '', '#' + info.hash);
  for (const [k, v] of Object.entries(tabInfo)) {
    const button = document.getElementById(v.nav);
    button.classList.toggle('active', k === tab);
    if (k === tab) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }



  document.querySelector('#sectionTitle').textContent = info.heading;
  document.querySelector('#crumb').textContent = ' / ' + info.heading.toUpperCase();

  if (tab !== 'bottles') offersOnly = false; 
  updateOfferToggle();
  resetFilters(); render();
}
function toast(msg) {let el = document.querySelector('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => el.classList.remove('show'), 2700);}
function closeModal() {
  const overlay = document.querySelector('#overlay');
  if (!overlay.classList.contains('open')) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  CatalogUI.close(overlay);
}
function optionTags(values, selected) {return values.map(x => `<option value="${escapeHtml(x)}" ${x === selected ? 'selected' : ''}>${escapeHtml(x)}</option>`).join('');}
function ownershipChoices(v) {return `<option value="owned" ${v === 'owned' ? 'selected' : ''}>Imam</option><option value="past" ${v === 'past' ? 'selected' : ''}>Arhiva</option><option value="wish" ${v === 'wish' ? 'selected' : ''}>Želim</option>`;}
function newItem() {let kind = tab === 'testers' ? 'tester' : 'bottle'; return {kind, brand: '', name: '', description: '', ml: null, capacity: null, count: 1, price2: null, price5: null, price10: null, salePrice: null, saleRange: '', targetPrice: null, frRating: null, frUrl: '', category: 'Niche', family: 'Svježi', ownership: tab === 'past' ? 'past' : tab === 'wish' ? 'wish' : 'owned', status: tab === 'testers' ? 'Za isprobati' : tab === 'past' ? 'Imao' : tab === 'wish' ? 'Želim' : 'U kolekciji', review: '', personalRating: null, image: ''};}
async function optimiseImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Odaberi JPG, PNG ili WebP fotografiju.');
  if (file.size > 16 * 1024 * 1024) throw new Error('Fotografija je prevelika (maksimalno 16 MB).');
  const bitmap = await createImageBitmap(file), maxSide = 760, scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(bitmap.width * scale)); cv.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = cv.getContext('2d'); ctx.fillStyle = '#f5f5f2'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(bitmap, 0, 0, cv.width, cv.height); bitmap.close?.();
  return cv.toDataURL('image/jpeg', .74);
}
function openEdit(id) {
  if (!isAdmin) return;
  const old = id ? all().find(x => x.id === id) : null; if (id && !old) return;
  const item = old ? {...old} : newItem(); const isNew = !old, isBottle = item.kind === 'bottle';
  document.querySelector('#modalTitle').textContent = isNew ? 'Dodaj novi miris' : 'Uredi miris';
  document.querySelector('#modalSubtitle').textContent = isBottle ? 'Bočica · stanje, fotografija i cjenik' : 'Tester · slika, količina i vlastite ocjene';
  let currentRating = item.personalRating, chosenImage = safeUrl(item.image), imgChanged = false;
  const form = document.querySelector('#editForm');
  form.innerHTML = `<div class="form-grid">
  <div class="field"><label>Brend</label><input required name="brand" value="${escapeHtml(item.brand)}" placeholder="Npr. Xerjoff"></div>
  <div class="field"><label>Naziv parfema</label><input required name="name" value="${escapeHtml(item.name)}" placeholder="Naziv"></div>
  <div class="field"><label>Vrsta</label><select name="category">${optionTags(['Niche', 'Designer', 'Luxury', 'Arabski', 'Ostalo'], item.category)}</select></div>
  <div class="field"><label>Skupina</label><select name="family">${optionTags(families, item.family)}</select></div>
  <div class="field wide"><label>Opis mirisa i note</label><textarea name="description" rows="2">${escapeHtml(item.description)}</textarea></div>
  <div class="modal-section"><h3>Stanje u arhivu</h3><small>Prebacuj između „Imam / Arhiva / Želim”</small></div>
  <div class="field wide"><label>Vlasništvo</label><select name="ownership">${ownershipChoices(item.ownership)}</select></div>
  <div class="field"><label>${isBottle ? 'Preostalo ml' : 'Količina po testeru (ml)'}</label><input name="ml" inputmode="decimal" type="number" min="0" step="0.1" value="${item.ml ?? ''}" placeholder="Ostavi prazno ako ne znaš"></div>
  <div class="field"><label>${isBottle ? 'Veličina bočice (ml)' : 'Broj istih testera'}</label><input name="${isBottle ? 'capacity' : 'count'}" inputmode="decimal" type="number" min="${isBottle ? '0' : '1'}" step="1" value="${isBottle ? (item.capacity ?? '') : (item.count || 1)}"></div>
  ${isBottle ? `<div class="field wide"><label>Dostupnost parfema</label><select name="status">${optionTags(statuses, saleStatus(item) ? 'Prodaja/zamjena' : 'U kolekciji')}</select><small>Ocjena 7/10 ili manje automatski označava parfem za prodaju/zamjenu.</small></div>` : `<input type="hidden" name="status" value="${escapeHtml(item.status || '')}">`}
  <div class="modal-section"><h3>Fotografija</h3><small>Slike iz tvog ZIP-a već su povezane</small></div>
  <div class="field wide photo-uploader"><label>Odaberi vlastitu fotografiju (automatski se smanji za brže učitavanje)</label><input type="file" id="photoFile" accept="image/png,image/jpeg,image/webp" aria-label="Dodaj fotografiju"><img id="editPreview" class="photo-preview" alt="Pregled fotografije" ${chosenImage ? `src="${escapeHtml(chosenImage)}"` : ''} style="${chosenImage ? '' : 'display:none'}"><button id="removePhoto" type="button" class="btn simple">Ukloni fotografiju</button></div>
  <div class="field wide"><label>URL ili relativna putanja do slike</label><input name="image" value="${escapeHtml(chosenImage.startsWith('data:') ? '' : chosenImage)}" placeholder="https://… ili assets/bottles/b043.webp"><div class="note">Za kasniji hosting preporučene su putanje unutar mape assets/. Slike koje ručno dodaš kroz ovaj obrazac spremaju se samo u tvoj preglednik i JSON backup.</div></div>
  <div class="modal-section"><h3>Ocjene i dojam</h3><small>Fragrantica ≠ tvoja ocjena</small></div>
  <div class="field"><label>Fragrantica (0–5)</label><input name="frRating" type="number" min="0" max="5" step="0.01" value="${item.frRating ?? ''}" placeholder="Nije upisano"></div>
  <div class="field"><label>Fragrantica URL</label><input name="frUrl" type="url" value="${escapeHtml(item.frUrl || '')}" placeholder="https://www.fragrantica.com/…"></div>
  <div class="field wide"><label>Moja ocjena (0–10)</label><div class="rating-edit"><input id="modalRate" type="range" min="0" max="10" step="0.5" value="${item.personalRating ?? 5}" aria-label="Moja ocjena"><span class="big" id="modalRateValue">${currentRating == null ? '— / 10' : fmt(currentRating) + ' / 10'}</span><button type="button" id="clearRating">Poništi</button></div></div>
  <div class="field wide"><label>Moje bilješke, trajnost i dojmovi</label><textarea name="review" rows="3">${escapeHtml(item.review || '')}</textarea></div>
  ${!isBottle ? `<div class="field"><label>Cijena tvorničkog uzorka (€)</label><input name="samplePrice" type="number" min="0" step="0.1" value="${item.samplePrice ?? ''}"></div>` : ''}
  ${isBottle ? `<div class="modal-section"><h3>Dekanti i vrijednost bočice</h3><small>€ · sve se može kasnije urediti</small></div>
  <div class="field"><label>2 ml DKNT (€)</label><input name="price2" type="number" min="0" step="0.1" value="${item.price2 ?? ''}"></div>
  <div class="field"><label>5 ml DKNT (€)</label><input name="price5" type="number" min="0" step="0.1" value="${item.price5 ?? ''}"></div>
  <div class="field"><label>10 ml DKNT (€)</label><input name="price10" type="number" min="0" step="0.1" value="${item.price10 ?? ''}"></div>
  <div class="field"><label>Moja prodajna cijena (€)</label><input name="salePrice" type="number" min="0" step="0.5" value="${item.salePrice ?? ''}"></div>
  <div class="field wide"><label>Okvirna procjena (ako nema prodajne cijene)</label><input name="saleRange" value="${escapeHtml(item.saleRange || '')}" placeholder="Npr. 40–60 €"></div>
  <div class="field wide"><label>Ciljana kupovna cijena (€), za listu želja</label><input name="targetPrice" type="number" min="0" step="0.5" value="${item.targetPrice ?? ''}"></div>` : ''}
  <div class="field wide"><div class="note"><a href="${escapeHtml(fragUrl(item))}" target="_blank" rel="noopener noreferrer">↗ Otvori Fragranticu / pretragu mirisa</a><div>Ocjene se ne osvježavaju automatski; mogu se ručno urediti.</div></div></div>
  </div><div class="modal-actions"><div>${!isNew ? '<button class="btn danger" id="deleteBtn" type="button">Trajno izbriši</button>' : ''}</div><div class="right"><button class="btn simple" type="button" id="cancelBtn">Odustani</button><button class="btn strong" type="submit">Spremi promjene</button></div></div>`;
  form.querySelector('#modalRate').addEventListener('input', ev => {currentRating = Number(ev.target.value); form.querySelector('#modalRateValue').textContent = fmt(currentRating) + ' / 10';});
  form.querySelector('#clearRating').addEventListener('click', () => {currentRating = null; form.querySelector('#modalRateValue').textContent = '— / 10';});
  form.querySelector('#cancelBtn').addEventListener('click', closeModal);
  form.querySelector('#removePhoto').addEventListener('click', () => {chosenImage = ''; imgChanged = true; form.querySelector('[name="image"]').value = ''; form.querySelector('#editPreview').style.display = 'none'; form.querySelector('#photoFile').value = '';});
  form.querySelector('[name="image"]').addEventListener('input', ev => {chosenImage = safeUrl(ev.target.value); imgChanged = true; let p = form.querySelector('#editPreview'); p.style.display = chosenImage ? 'block' : 'none'; if (chosenImage) p.src = chosenImage;});
  form.querySelector('#photoFile').addEventListener('change', async ev => {const file = ev.target.files?.[0]; if (!file) return; try {const b = await optimiseImage(file); chosenImage = b; imgChanged = true; const img = form.querySelector('#editPreview'); img.style.display = 'block'; img.src = b; form.querySelector('[name="image"]').value = ''; toast('Slika pripremljena — klikni Spremi promjene');} catch (err) {alert(err.message);} });
  if (!isNew) form.querySelector('#deleteBtn').addEventListener('click', () => deleteItem(item));
  form.onsubmit = async ev => {
    ev.preventDefault(); const fd = new FormData(form); let updated = {...item, personalRating: currentRating};
    for (const k of ['brand', 'name', 'description', 'category', 'family', 'ownership', 'status', 'review', 'frUrl', 'saleRange']) updated[k] = String(fd.get(k) || '').trim();
    for (const k of ['ml', 'capacity', 'count', 'frRating', 'price2', 'price5', 'price10', 'salePrice', 'targetPrice', 'samplePrice']) if (fd.has(k)) updated[k] = numOrNull(fd.get(k));
    updated.image = imgChanged ? chosenImage : (safeUrl(fd.get('image')) || chosenImage); if (updated.count == null || updated.count < 1) updated.count = 1;
    if (updated.frRating != null && (updated.frRating < 0 || updated.frRating > 5)) {alert('Fragrantica ocjena mora biti od 0 do 5.'); return;}
    if (updated.ml != null && updated.capacity != null && updated.kind === 'bottle' && updated.ml > updated.capacity) {alert('Preostalo ml ne može biti veće od kapaciteta bočice.'); return;}
    if (!ownershipLabels[updated.ownership]) {alert('Odaberi vlasništvo.'); return;}
    if (updated.ownership === 'past' && updated.status === 'U kolekciji') updated.status = 'Imao';
    if (updated.ownership === 'wish' && updated.status === 'U kolekciji') updated.status = 'Želim';
    setAutomaticTrade(updated, old);
    if (!updated.id) updated.id = updated.kind[0] + '-custom-' + (globalThis.crypto?.randomUUID?.() || (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)));
    const arr = updated.kind === 'bottle' ? catalog.bottles : catalog.testers, idx = arr.findIndex(x => x.id === updated.id);
    if (idx < 0) arr.unshift(updated); else arr[idx] = updated;
    if (await persist()) {render(); closeModal(); toast('Miris je spremljen online');} else {await refreshCatalog(); render();}
  };
  document.querySelector('#overlay').classList.add('open'); document.querySelector('#overlay').setAttribute('aria-hidden', 'false');
  form.querySelectorAll('.field').forEach((field, index) => {
    const label = field.querySelector('label');
    const input = field.querySelector('input,select,textarea');
    if (label && input) { input.id ||= `edit-field-${index}`; label.htmlFor = input.id; }
  });
  CatalogUI.open(document.querySelector('#overlay'), form.querySelector('[name="brand"]'));
}
async function deleteItem(item) { if (!isAdmin) return;if (!confirm('Trajno izbrisati ' + item.brand + ' ' + item.name + '? Ako ga želiš samo maknuti iz kolekcije, odaberi „Arhiva”.')) return; const k = item.kind === 'bottle' ? 'bottles' : 'testers'; catalog[k] = catalog[k].filter(x => x.id !== item.id); catalog.deletedIds = [...new Set([...(catalog.deletedIds || []), item.id])]; if (await persist()) {render(); closeModal(); toast('Miris izbrisan');} else {await refreshCatalog(); render();} }
function downloadFile(name, text, mime) {const blob = new Blob([text], {type: mime}), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 3500);}
function exportBackup() {downloadFile('moj-mirisni-arhiv-backup-v4.json', JSON.stringify({...catalog, version: 4, exportedAt: new Date().toISOString()}, null, 2), 'application/json'); toast('Backup preuzet');}
function exportCSV() {
  const cols = ['brand', 'name', 'kind', 'ownership', 'ml', 'capacity', 'count', 'family', 'category', 'status', 'frRating', 'personalRating', 'price2', 'price5', 'price10', 'salePrice', 'targetPrice', 'saleRange', 'description', 'review', 'image', 'frUrl']; const head = ['Brend', 'Parfem', 'Vrsta', 'Vlasništvo', 'Preostalo ml', 'Bočica ml', 'Broj', 'Skupina', 'Kategorija', 'Status', 'Fragrantica', 'Moja ocjena', 'DKNT 2ml', 'DKNT 5ml', 'DKNT 10ml', 'Prodajna cijena', 'Ciljana cijena', 'Procjena', 'Opis', 'Bilješke', 'Slika', 'Fragrantica URL'];
  if (!isAdmin) {const privateIndex = cols.indexOf('personalRating'); cols.splice(privateIndex,1); head.splice(privateIndex,1);}
  let rows = [head.map(v => '"' + v.replace(/"/g, '""') + '"').join(';')]; for (const i of active()) rows.push(cols.map(k => '"' + String(k === 'image' && String(i.image || '').startsWith('data:') ? '[slika je u JSON backupu]' : i[k] ?? '').replace(/"/g, '""') + '"').join(';'));
  downloadFile(tabInfo[tab].hash + '.csv', '\ufeff' + rows.join('\r\n'), 'text/csv;charset=utf-8'); toast('CSV preuzet');
}
function mergeAdditions(current, incoming) {
  const result = clone(current);
  const keyOf = item => normalizeSearch(item.brand + ' ' + item.name).replace(/[^a-z0-9]/g, '');
  for (const key of ['bottles', 'testers']) {
    const ids = new Set(result[key].map(item => item.id));
    const names = new Set(result[key].filter(item => item.ownership === 'owned').map(keyOf));
    for (const item of incoming[key]) {
      if (!item || !item.id || ids.has(item.id) || names.has(keyOf(item))) continue;
      if (result.deletedIds?.includes(item.id)) continue;
      result[key].push(normalizeItem(item, {}));
      ids.add(item.id);
      names.add(keyOf(item));
    }
  }
  return result;
}
function importBackup(ev) { if (!isAdmin) return;
  const file = ev.target.files?.[0]; ev.target.value = ''; if (!file) return;
  const reader = new FileReader(); reader.onload = async () => {try {let data = JSON.parse(reader.result); if (!Array.isArray(data.bottles) || !Array.isArray(data.testers)) throw new Error('Neispravan format backupa.'); const additionsOnly = data.mode === 'additions'; if (!confirm(additionsOnly ? 'Dodati samo nove parfeme i sačuvati postojeće količine i ocjene?' : 'Uvoz će zamijeniti trenutni popis u ovom pregledniku. Nastaviti?')) return; catalog = additionsOnly ? mergeAdditions(catalog, data) : mergeCatalog(data, !data.version || data.version < 4); if (await persist()) {render(); toast('Backup uspješno objavljen');} else {await refreshCatalog(); render();} } catch (err) {alert('Ne mogu uvesti backup: ' + err.message);} }; reader.readAsText(file);
}
async function resetCatalog() { if (!isAdmin) return;if (!confirm('Vratiti početni arhiv? Ovo će izbrisati sve tvoje naknadne unose, fotografije, ocjene i izmjene ako nemaš backup.')) return; if (!confirm('Jesi li siguran?')) return; catalog = clone(initial); if (await persist()) {render(); toast('Početni arhiv objavljen');} else {await refreshCatalog(); render();} }
async function copyList() {const text = active().map(i => `${i.brand} ${i.name} · ${amMl(i)}${i.kind === 'bottle' ? ` · 2/5/10 ml: ${euro(i.price2)}/${euro(i.price5)}/${euro(i.price10)}` : ''}`).join('\n'); try {await navigator.clipboard.writeText(text); toast('Popis kopiran');} catch (_) {const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); toast('Popis kopiran');} }
function init() {
  setupPresentation();
  const cards = document.getElementById('cards');
  cards.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || !cards.contains(button)) return;
    if (button.id === 'emptyReset') return resetFilters();
    if (button.dataset.detail) return openDetails(button.dataset.detail);
    if (button.dataset.edit || button.dataset.rate) return openEdit(button.dataset.edit || button.dataset.rate);
    if (button.dataset.delete) {
      const item = all().find(item => item.id === button.dataset.delete);
      if (item) void deleteItem(item);
    }
  });
  cards.addEventListener('change', event => {
    if (event.target.matches('[data-move]')) void moveItem(event.target.dataset.move, event.target.value);
  });
  for (const [name, meta, label, icon, count] of [['bottles', tabInfo.bottles, 'Parfemi', ICONS.bottle, 'bcount'], ['testers', tabInfo.testers, 'Testeri', ICONS.vial, 'tcount'], ['past', tabInfo.past, 'Arhiva', ICONS.history, 'hcount'], ['wish', tabInfo.wish, 'Želim', ICONS.heart, 'wcount']]) {
    const el = document.getElementById(meta.nav); el.dataset.view = name; el.innerHTML = icon + `<span>${label}</span><em id="${count}">0</em>`; el.addEventListener('click', () => switchTab(name));
  }
  document.querySelector('#addBtn').innerHTML = ICONS.plus + '<span>Dodaj</span>';
  document.querySelector('#exportBtn').innerHTML = ICONS.download + '<span>Backup JSON</span>';
  document.querySelector('#importBtn').innerHTML = ICONS.import + '<span>Uvezi</span>';
  document.querySelector('#searchIcon').innerHTML = ICONS.search;

  document.querySelector('#sortFilter').innerHTML = '<option value="default">Početni redoslijed</option><option value="name-asc">Naziv A–Z</option><option value="name-desc">Naziv Z–A</option><option value="fr-desc">Fragrantica ↓</option><option value="fr-asc">Fragrantica ↑</option><option value="personal-desc">Moja ocjena ↓</option><option value="personal-asc">Moja ocjena ↑</option><option value="ml-desc">Količina ↓</option><option value="ml-asc">Količina ↑</option>';
  document.querySelector('#searchInput').addEventListener('input', ev => {const value = normalizeSearch(ev.target.value); clearTimeout(searchDebounce); searchDebounce = setTimeout(() => {search=value;  renderCards();}, 160);});

  document.querySelector('#sortFilter').addEventListener('change', ev => {sortBy = ev.target.value;  renderCards();});
  document.querySelector('#offerToggle').addEventListener('click', () => {offersOnly = !offersOnly;  updateOfferToggle(); renderCards();});
  document.querySelector('#detailClose').addEventListener('click', closeDetails);
  document.querySelector('#detailShare').addEventListener('click', shareCurrentPerfume);
  document.querySelector('#detailOverlay').addEventListener('click', ev => {if (ev.target.id === 'detailOverlay') closeDetails();});
  document.querySelector('#addBtn').addEventListener('click', () => openEdit(null));
  document.querySelector('#exportBtn').addEventListener('click', exportBackup);
  document.querySelector('#importBtn').addEventListener('click', () => document.querySelector('#importFile').click());
  document.querySelector('#importFile').addEventListener('change', importBackup);
  document.querySelector('#csvBtn').addEventListener('click', exportCSV);
  document.querySelector('#copyBtn').addEventListener('click', copyList);
  document.querySelector('#copyOffersBtn').addEventListener('click', copyOffers);
  document.querySelector('#resetBtn').addEventListener('click', resetCatalog);
  document.querySelector('#backupFooter').addEventListener('click', ev => {ev.preventDefault(); exportBackup();});
  document.querySelector('#modalClose').addEventListener('click', closeModal);
  document.querySelector('#overlay').addEventListener('click', ev => {if (ev.target.id === 'overlay') closeModal();});
  window.addEventListener('keydown', ev => {if (ev.key === 'Escape') {closeDetails(); closeModal();}});
  window.addEventListener('hashchange', () => switchTab(tabFromHash(), false));
  document.body.classList.add('viewer-mode');
  document.querySelectorAll('#sortFilter option[value^="personal-"]').forEach(option => { option.hidden = true; option.disabled = true; });
  switchTab(tab, false);
  openSharedPerfume();
  initCloud();
}
init();

async function refreshCatalog() {
  if (!db) return;
  const result = isAdmin ? await db.from('catalog_state').select('data').eq('id',1).maybeSingle() : await db.rpc('public_perfume_catalog');
  const {data, error} = result;
  if (error) { console.warn('Čitanje online kataloga:',error.message); document.querySelector('#storageNotice').textContent = 'Potrebno je pokrenuti SQL migraciju iz ZIP-a kako bi javni katalog radio.';document.querySelector('#storageNotice').classList.add('show'); return; }
  const payload = isAdmin ? data?.data : data;
  if (payload?.bottles && payload?.testers) catalog = mergeCatalog(payload);
  else catalog = clone(initial);
  render();
  openSharedPerfume();
}
function setAdminMode(value) {
  isAdmin = Boolean(value);
  if (!isAdmin) {
    closeDetails();
    catalog.bottles.forEach(item => {item.personalRating = null;});
    catalog.testers.forEach(item => {item.personalRating = null;});
  }
  document.body.classList.toggle('viewer-mode',!isAdmin);
  const b=document.querySelector('#adminAccess');
  if(b) { b.textContent=isAdmin ? 'Odjava' : 'Prijava vlasnika'; updateAdminAccess(b); }
  document.querySelectorAll('#sortFilter option[value^="personal-"]').forEach(option => {option.hidden = !isAdmin;option.disabled = !isAdmin;});
  if(!isAdmin && sortBy.startsWith('personal-')) {sortBy='default';document.querySelector('#sortFilter').value='default';}
  if(db) void refreshCatalog(); else {render();openSharedPerfume();}
}
function updateAdminAccess(button) {
  const visible = isAdmin || new URLSearchParams(window.location.search).get('admin') === '1';
  button.hidden = !visible;
  button.style.display = visible ? '' : 'none';
}
function bindOwnerGesture(button) {
  const target = document.querySelector('.mark-text b');
  if (!target) return;
  let clicks = 0;
  let startedAt = 0;
  const activate = () => {
    if (isAdmin) return;
    const now = performance.now();
    if (!clicks || now - startedAt > 3000) { clicks = 0; startedAt = now; }
    clicks += 1;
    if (clicks < 5) return;
    clicks = 0;
    if (typeof button.onclick === 'function') button.click();
    else toast('Prijava se još učitava. Pokušaj ponovno za trenutak.');
  };
  target.setAttribute('role', 'button');
  target.tabIndex = 0;
  target.style.touchAction = 'manipulation';
  target.style.userSelect = 'none';
  target.addEventListener('click', activate);
  target.addEventListener('keydown', event => {
    if (event.repeat || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    activate();
  });
}
async function initCloud() {
  const button=document.createElement('button');
  button.id='adminAccess'; button.className='btn simple'; button.type='button';
  button.textContent='Prijava vlasnika';
  updateAdminAccess(button);
  document.querySelector('.tools').append(button);
  bindOwnerGesture(button);
  const settings=window.MIRISNI_CONFIG || {};
  if(!settings.supabaseUrl || !settings.supabaseAnonKey || !window.supabase) {
    button.title='Povezivanje se aktivira kada popuniš js/config.js i izvršiš SQL skriptu';
    button.onclick=()=>alert('Supabase nije podešen. Otvori README_SUPABASE.md.');
    return;
  }
  try {
    db=window.supabase.createClient(settings.supabaseUrl,settings.supabaseAnonKey);
    connected=true;
    await refreshCatalog();
    const {data:{session}}=await db.auth.getSession();
    if(session?.user) await verifyOwner(session.user);
    db.auth.onAuthStateChange((_event,session)=>{
      if(!session) setAdminMode(false);
      else verifyOwner(session.user);
    });
    button.onclick=async()=>{
      if(isAdmin) { await db.auth.signOut(); setAdminMode(false); return; }
      const email=prompt('Email vlasnika (Supabase Auth):');
      if(!email) return;
      const password=prompt('Lozinka:');
      if(!password) return;
      const {data,error}=await db.auth.signInWithPassword({email,password});
      if(error) {alert('Prijava nije uspjela: '+error.message);return;}
      await verifyOwner(data.user);
      if(isAdmin) alert('Prijavljen si. Izmjene se sada spremaju u Supabase.');
    };
  } catch(err){console.error(err);button.onclick=()=>alert('Provjeri Supabase konfiguraciju.');}
}
async function verifyOwner(user) {
  if (!user || ownerCheckInProgress) return;
  ownerCheckInProgress = true;
  try {
  const {data,error}=await db.rpc('is_catalog_owner');
  setAdminMode(!error && data === true);
  if(isAdmin) {
    const {data:existing,error:readError}=await db.from('catalog_state').select('id').eq('id',1).maybeSingle();
    if(!readError && !existing) {
      const publish=confirm('Online katalog je prazan. Želiš li sada objaviti postojeći katalog s fotografijama i cijenama?');
      if(publish) {if(await persist()) toast('Početni katalog objavljen online');}
    }
  }
  } finally { ownerCheckInProgress = false; }
}
