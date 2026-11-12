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
const KEY = 'mirisniArhiv_v4_20261112';
const V3_KEY = 'mirisniArhiv_v3_20261112';
const PREVIOUS_KEY = 'mirisniArhiv_v2_20261112';
const OLD_KEY = 'mirisniArhiv_v1_20261112';
const ownershipLabels = {owned: 'Imam', past: 'Imao', wish: 'Želim'};
const tabInfo = {
  bottles: {nav: 'navB', hash: 'imam', heading: 'Moji parfemi', kicker: 'MOJA POLICA · IMAM', hero: 'Moja kolekcija, <i>moj potpis.</i>', desc: 'Sve bočice koje trenutno imaš. Stanje u ml, stvarne fotografije, dekanti, procjene i vlastite ocjene.', helper: 'Količine bez potvrde ostaju prazne. Cijene dekanta su iz tvoje evidencije, a procjene bočica su orijentacijske.'},
  testers: {nav: 'navT', hash: 'testeri', heading: 'Moji testeri', kicker: 'DISCOVERY · TESTERI', hero: 'Mali uzorci, <i>velika otkrića.</i>', desc: 'Tvoj dnevnik isprobavanja: niche i designer uzorci, Fragrantica i osobne ocjene od 0 do 10.', helper: 'Ovdje su samo testeri koje još imaš. Ako potrošiš uzorak, prebaci ga u „Imao”.'},
  past: {nav: 'navH', hash: 'imao', heading: 'Mirisi koje sam imao', kicker: 'ARHIVA · IMAO', hero: 'Svaki miris ima, <i>svoju priču.</i>', desc: 'Parfemi i testeri koji su prodani, potrošeni ili zamijenjeni. Ostaju u arhivi zajedno s tvojim dojmovima.', helper: 'Promijeni status na „Imam” ako isti miris ponovno dođe u kolekciju.'},
  wish: {nav: 'navW', hash: 'zelim', heading: 'Lista želja', kicker: 'PLANIRAM · ŽELIM', hero: 'Sljedeće otkriće, <i>čeka svoj red.</i>', desc: 'Parfemi i testeri koje želiš isprobati ili nabaviti. Uredi očekivanu cijenu i ocjene kada ih testiraš.', helper: 'Na listi želja možeš upisati ciljani budžet. Kad nešto nabaviš, jednim klikom prebaci u „Imam”.'}
};
const familyColors = {'Voćni': '214,145,126', 'Gourmand': '218,170,103', 'Drvenasti': '136,169,134', 'Mošusni': '159,164,194', 'Svježi': '117,178,184', 'Citrusni': '203,185,108', 'Začinski': '180,124,101', 'Morski': '109,173,193', 'Kožnati': '176,128,96', 'Aromatični': '147,174,132', 'Cvjetni': '196,151,165', 'Eksperimentalni': '159,130,170', 'Mineralni': '138,163,169', 'Zeleni': '136,179,132', 'Puderasti': '189,178,164', 'Tropski': '203,161,105', 'Čajni': '146,175,144', 'Nepoznato': '145,160,158'};
const statuses = ['U kolekciji', 'Zadržati', 'Za prodaju', 'Za zamjenu', 'Moguća zamjena', 'Ne nudim', 'Provjeriti', 'Za isprobati', 'Sviđa mi se', 'Ne sviđa mi se', 'Isprobano', 'Imao', 'Želim'];
const families = Object.keys(familyColors);
const initial = structuredClone(SEED_DATA);
initial.deletedIds = [];
let catalog = readData(), tab = tabFromHash(), search = '', filterFamily = '', filterStatus = '', sortBy = 'default', toastTimeout = null;

function escapeHtml(v) {return String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));}
function fmt(n) {return Number(n).toLocaleString('hr-HR', {maximumFractionDigits: 2});}
function euro(n) {return n == null || n === '' ? '—' : fmt(n) + ' €';}
function numOrNull(v) {if (v == null || String(v).trim() === '') return null; const n = Number(String(v).replace(',', '.')); return Number.isFinite(n) ? n : null;}
function safeUrl(url) {const s = String(url || '').trim(); return /^(https:\/\/|assets\/|\.\/assets\/|images\/|\.\/images\/|data:image\/(jpeg|png|webp);base64,)/i.test(s) ? s : '';}
function renderImage(item) {let src = safeUrl(item.image); if (src) return `<div class="bottle-art" aria-hidden="true"><span>✦</span></div><img class="perfume-image" loading="lazy" decoding="async" src="${escapeHtml(src)}" alt="${escapeHtml(item.brand + ' ' + item.name)}" onerror="this.closest('.art').classList.remove('has-image');this.remove()">`; return `<div class="bottle-art" aria-hidden="true"><span>✦</span></div>`;}
function clone(obj) {return structuredClone(obj);}
function normalizeItem(i, seed) {const j = {...seed, ...i}; j.ownership = ['owned', 'past', 'wish'].includes(j.ownership) ? j.ownership : 'owned'; j.image = Object.prototype.hasOwnProperty.call(i, 'image') ? safeUrl(i.image) : (safeUrl(seed?.image) || ''); j.count = Math.max(1, Number(j.count) || 1); return j;}
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
      if (seen.has(item.id) || deleted.has(item.id) || ['t049', 't053', 'h009', 'b008', 'b037', 'b038'].includes(item.id)) continue;
      seen.add(item.id);

      const seed = defaults.get(item.id) || {};
      const updated = normalizeItem(item, seed);
      if (previous && !safeUrl(updated.image) && safeUrl(seed.image)) updated.image = seed.image;

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
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return mergeCatalog(JSON.parse(saved));

    for (const key of [V3_KEY, PREVIOUS_KEY, OLD_KEY]) {
      const earlier = localStorage.getItem(key);
      if (earlier) return mergeCatalog(JSON.parse(earlier), true);
    }
  } catch (error) {
    console.warn('Neuspješno učitavanje podataka', error);
  }
  return clone(initial);
}

function persist() {
  try {localStorage.setItem(KEY, JSON.stringify(catalog)); document.querySelector('#storageNotice').classList.remove('show'); return true;}
  catch (err) {document.querySelector('#storageNotice').classList.add('show'); toast('Spremanje nije uspjelo — preuzmi backup'); return false;}
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
  const data = active(), rated = data.filter(x => x.personalRating != null), bottles = data.filter(x => x.kind === 'bottle'), testers = data.filter(x => x.kind === 'tester');
  if (tab === 'bottles') return [['Bočice koje imam', data.length, 'trenutno u kolekciji'], ['Ukupno poznatih ml', fmt(data.reduce((n, x) => n + (x.ml || 0), 0)), 'nepoznate količine nisu uključene'], ['Za prodaju ili zamjenu', data.filter(x => /prodaju|zamjenu/.test(x.status)).length, 'prema statusu ponude'], ['Nedostaje količina', data.filter(x => x.ml == null).length, 'možeš dopuniti u uređivanju']];
  if (tab === 'testers') return [['Različitih uzoraka', data.length, `${data.reduce((n, x) => n + (x.count || 1), 0)} fizičkih testera`], ['Ocijenjeno', rated.length, 'od ukupno ' + data.length], ['Favoriti 8+ / 10', data.filter(x => x.personalRating >= 8).length, 'prema tvojim ocjenama'], ['Poznato ml', fmt(data.reduce((n, x) => n + (x.ml || 0) * (x.count || 1), 0)), 'ostalo nije potvrđeno']];
  if (tab === 'past') return [['U povijesti', data.length, 'mirisa ukupno'], ['Bočice', bottles.length, 'više ih nemaš'], ['Testeri', testers.length, 'potrošeni ili uklonjeni'], ['Sačuvane ocjene', rated.length, 'možeš ponovno usporediti']];
  return [['Lista želja', data.length, 'mirisa koje razmatraš'], ['Bočice', bottles.length, 'koje želiš nabaviti'], ['Testeri', testers.length, 'koje želiš isprobati'], ['Ciljana cijena', euro(bottles.reduce((n, x) => n + (x.targetPrice || 0), 0)), 'ukupno upisanih budžeta']];
}
function render() {
  const ownedB = catalog.bottles.filter(x => x.ownership === 'owned').length, ownedT = catalog.testers.filter(x => x.ownership === 'owned').length;
  const past = all().filter(x => x.ownership === 'past').length, wish = all().filter(x => x.ownership === 'wish').length;
  for (const [id, val] of Object.entries({bcount: ownedB, tcount: ownedT, hcount: past, wcount: wish})) document.getElementById(id).textContent = val;
  document.querySelector('#stats').innerHTML = statData().map(([label, note, sub]) => `<div class="stat"><div class="slabel">${escapeHtml(label)}</div><div class="snumber">${escapeHtml(note)}</div><div class="ssub">${escapeHtml(sub)}</div></div>`).join('');
  renderCards();
}
function renderCards() {
  let data = active().filter(x => {
    const term = [x.brand, x.name, x.description, x.review, x.family, x.category, x.status].join(' ').toLocaleLowerCase('hr');
    return (!search || term.includes(search)) && (!filterFamily || x.family === filterFamily) && (!filterStatus || x.status === filterStatus);
  });
  if (sortBy === 'name') data.sort((a, b) => (a.brand + ' ' + a.name).localeCompare(b.brand + ' ' + b.name, 'hr'));
  if (sortBy === 'fr') data.sort((a, b) => (b.frRating ?? -1) - (a.frRating ?? -1));
  if (sortBy === 'personal') data.sort((a, b) => (b.personalRating ?? -1) - (a.personalRating ?? -1));
  if (sortBy === 'ml') data.sort((a, b) => (b.ml ?? -1) - (a.ml ?? -1));
  if (sortBy === 'unrated') data.sort((a, b) => (a.personalRating == null ? -1 : 1) - (b.personalRating == null ? -1 : 1));
  document.querySelector('#shownCount').textContent = `Prikazano ${data.length} od ${active().length} mirisa`;
  const el = document.querySelector('#cards');
  if (!data.length) {el.innerHTML = '<div class="empty"><b>Ovdje je zasad prazno</b>Dodaj novi miris ili promijeni filter. Možeš premjestiti postojeće mirise iz drugih stranica.</div>'; return;}
  el.innerHTML = data.map((i, ix) => {
    const isBottle = i.kind === 'bottle', src = safeUrl(i.image), rating = i.personalRating == null ? '—' : fmt(i.personalRating), fRating = i.frRating == null ? '—' : fmt(i.frRating), price = suggested(i);
    const isOwned = i.ownership === 'owned', offer = isBottle && isOwned ? `<div class="info-footer"><span class="sub">Bočica: <b>${escapeHtml(price.value)}</b></span><button class="editlink" type="button" data-edit="${escapeHtml(i.id)}">${ICONS.edit} Uredi</button></div>` : `<div class="info-footer"><span class="sub">${isOwned ? 'Status:' : 'Vrsta:'} <b>${escapeHtml(isOwned ? i.status : (isBottle ? 'Bočica' : 'Tester'))}</b></span><button class="editlink" type="button" data-edit="${escapeHtml(i.id)}">${ICONS.edit} Uredi</button></div>`;
    const prices = isBottle && isOwned ? `<div class="meta"><span class="pill dim">2 ml ${euro(i.price2)}</span><span class="pill dim">5 ml ${euro(i.price5)}</span><span class="pill dim">10 ml ${euro(i.price10)}</span></div>` : '';
    return `<article class="card" style="--rgb:${familyColors[i.family] || '155,160,155'}">
   <div class="art ${src ? 'has-image' : ''}">${renderImage(i)}<span class="art-tag">${escapeHtml(i.category || 'Miris')}</span><span class="art-number">${String(ix + 1).padStart(2, '0')}</span>${!isOwned ? `<span class="badge-own">${escapeHtml(ownershipLabels[i.ownership])}</span>` : ''}</div>
   <div class="card-content"><div class="brand">${escapeHtml(i.brand)}</div><h3 class="card-title">${escapeHtml(i.name)}</h3><p class="card-desc">${escapeHtml(i.description || 'Opis još nije upisan.')}</p>
   <div class="meta"><span class="pill gold">${escapeHtml(amMl(i))}</span><span class="pill">${escapeHtml(i.family || 'Nepoznato')}</span></div>
   <div class="ratings"><a class="ratingbox" href="${escapeHtml(fragUrl(i))}" target="_blank" rel="noopener noreferrer" title="Fragrantica (otvara profil ili pretragu)"><small>Fragrantica ↗</small><strong class="goldtxt">${fRating} <em>/ 5</em></strong></a>
   <div class="ratingbox"><small>Moja ocjena</small><strong>${rating} <em>/ 10</em></strong></div></div>
   ${prices}${offer}
   <div class="move-row"><label for="move-${escapeHtml(i.id)}">Premjesti u</label><select class="move-select" id="move-${escapeHtml(i.id)}" aria-label="Premjesti ${escapeHtml(i.name)}" data-move="${escapeHtml(i.id)}"><option value="owned" ${i.ownership === 'owned' ? 'selected' : ''}>Imam</option><option value="past" ${i.ownership === 'past' ? 'selected' : ''}>Imao</option><option value="wish" ${i.ownership === 'wish' ? 'selected' : ''}>Želim</option></select>
   ${i.kind === 'tester' ? `<button class="editlink" type="button" data-rate="${escapeHtml(i.id)}">Ocijeni 0–10</button>` : '<span class="sub" style="font-size:10px;color:#80968a">Spremi promjenu</span>'}</div>
   </div></article>`;
  }).join('');
  el.querySelectorAll('[data-edit],[data-rate]').forEach(btn => btn.addEventListener('click', () => openEdit(btn.dataset.edit || btn.dataset.rate)));
  el.querySelectorAll('[data-move]').forEach(sel => sel.addEventListener('change', () => moveItem(sel.dataset.move, sel.value)));
}
function moveItem(id, newOwnership) {
  if (!ownershipLabels[newOwnership]) return; const i = all().find(x => x.id === id); if (!i) return;
  i.ownership = newOwnership; if (newOwnership === 'past') i.status = 'Imao'; else if (newOwnership === 'wish') i.status = 'Želim'; else if (['Imao', 'Želim'].includes(i.status)) i.status = i.kind === 'tester' ? 'Za isprobati' : 'U kolekciji';
  persist(); render(); toast(`${i.name}: ${ownershipLabels[newOwnership]}`);
}
function switchTab(next, updateHash = true) {
  if (!tabInfo[next]) return; tab = next; const info = tabInfo[tab]; if (updateHash && location.hash !== '#' + info.hash) history.replaceState(null, '', '#' + info.hash);
  for (const [k, v] of Object.entries(tabInfo)) document.getElementById(v.nav).classList.toggle('active', k === tab);
  document.querySelector('#heroKicker').textContent = info.kicker;
  document.querySelector('#heroTitle').innerHTML = info.hero;
  document.querySelector('#heroText').textContent = info.desc;
  document.querySelector('#sectionTitle').textContent = info.heading;
  document.querySelector('#crumb').textContent = ' / ' + info.heading.toUpperCase();
  document.querySelector('#helperText').textContent = info.helper;
  document.querySelector('#statusFilter').value = ''; filterStatus = '';
  document.querySelector('#searchInput').value = ''; search = '';
  document.querySelector('#familyFilter').value = ''; filterFamily = '';
  document.querySelector('#sortFilter').value = 'default'; sortBy = 'default'; render();
}
function toast(msg) {let el = document.querySelector('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => el.classList.remove('show'), 2700);}
function closeModal() {document.querySelector('#overlay').classList.remove('open'); document.querySelector('#overlay').setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';}
function optionTags(values, selected) {return values.map(x => `<option value="${escapeHtml(x)}" ${x === selected ? 'selected' : ''}>${escapeHtml(x)}</option>`).join('');}
function ownershipChoices(v) {return `<option value="owned" ${v === 'owned' ? 'selected' : ''}>Imam</option><option value="past" ${v === 'past' ? 'selected' : ''}>Imao</option><option value="wish" ${v === 'wish' ? 'selected' : ''}>Želim</option>`;}
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
  <div class="modal-section"><h3>Stanje u arhivu</h3><small>Prebacuj između „Imam / Imao / Želim”</small></div>
  <div class="field wide"><label>Vlasništvo</label><select name="ownership">${ownershipChoices(item.ownership)}</select></div>
  <div class="field"><label>${isBottle ? 'Preostalo ml' : 'Količina po testeru (ml)'}</label><input name="ml" inputmode="decimal" type="number" min="0" step="0.1" value="${item.ml ?? ''}" placeholder="Ostavi prazno ako ne znaš"></div>
  <div class="field"><label>${isBottle ? 'Veličina bočice (ml)' : 'Broj istih testera'}</label><input name="${isBottle ? 'capacity' : 'count'}" inputmode="decimal" type="number" min="${isBottle ? '0' : '1'}" step="1" value="${isBottle ? (item.capacity ?? '') : (item.count || 1)}"></div>
  <div class="field wide"><label>Status ${isBottle ? 'prodaje / zamjene' : 'isprobavanja'}</label><select name="status">${optionTags(statuses, item.status)}</select></div>
  <div class="modal-section"><h3>Fotografija</h3><small>Slike iz tvog ZIP-a već su povezane</small></div>
  <div class="field wide photo-uploader"><label>Odaberi vlastitu fotografiju (automatski se smanji za brže učitavanje)</label><input type="file" id="photoFile" accept="image/png,image/jpeg,image/webp" aria-label="Dodaj fotografiju"><img id="editPreview" class="photo-preview" alt="Pregled fotografije" ${chosenImage ? `src="${escapeHtml(chosenImage)}"` : ''} style="${chosenImage ? '' : 'display:none'}"><button id="removePhoto" type="button" class="btn simple">Ukloni fotografiju</button></div>
  <div class="field wide"><label>URL ili relativna putanja do slike</label><input name="image" value="${escapeHtml(chosenImage.startsWith('data:') ? '' : chosenImage)}" placeholder="https://… ili assets/bottles/b043.webp"><div class="note">Za kasniji hosting preporučene su putanje unutar mape assets/. Slike koje ručno dodaš kroz ovaj obrazac spremaju se samo u tvoj preglednik i JSON backup.</div></div>
  <div class="modal-section"><h3>Ocjene i dojam</h3><small>Fragrantica ≠ tvoja ocjena</small></div>
  <div class="field"><label>Fragrantica (0–5)</label><input name="frRating" type="number" min="0" max="5" step="0.01" value="${item.frRating ?? ''}" placeholder="Nije upisano"></div>
  <div class="field"><label>Fragrantica URL</label><input name="frUrl" type="url" value="${escapeHtml(item.frUrl || '')}" placeholder="https://www.fragrantica.com/…"></div>
  <div class="field wide"><label>Moja ocjena (0–10)</label><div class="rating-edit"><input id="modalRate" type="range" min="0" max="10" step="0.5" value="${item.personalRating ?? 5}" aria-label="Moja ocjena"><span class="big" id="modalRateValue">${currentRating == null ? '— / 10' : fmt(currentRating) + ' / 10'}</span><button type="button" id="clearRating">Poništi</button></div></div>
  <div class="field wide"><label>Moje bilješke, trajnost i dojmovi</label><textarea name="review" rows="3">${escapeHtml(item.review || '')}</textarea></div>
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
  form.onsubmit = ev => {
    ev.preventDefault(); const fd = new FormData(form); let updated = {...item, personalRating: currentRating};
    for (const k of ['brand', 'name', 'description', 'category', 'family', 'ownership', 'status', 'review', 'frUrl', 'saleRange']) updated[k] = String(fd.get(k) || '').trim();
    for (const k of ['ml', 'capacity', 'count', 'frRating', 'price2', 'price5', 'price10', 'salePrice', 'targetPrice']) if (fd.has(k)) updated[k] = numOrNull(fd.get(k));
    updated.image = imgChanged ? chosenImage : (safeUrl(fd.get('image')) || chosenImage); if (updated.count == null || updated.count < 1) updated.count = 1;
    if (updated.frRating != null && (updated.frRating < 0 || updated.frRating > 5)) {alert('Fragrantica ocjena mora biti od 0 do 5.'); return;}
    if (updated.ml != null && updated.capacity != null && updated.kind === 'bottle' && updated.ml > updated.capacity) {alert('Preostalo ml ne može biti veće od kapaciteta bočice.'); return;}
    if (!ownershipLabels[updated.ownership]) {alert('Odaberi vlasništvo.'); return;}
    if (updated.ownership === 'past' && updated.status === 'U kolekciji') updated.status = 'Imao';
    if (updated.ownership === 'wish' && updated.status === 'U kolekciji') updated.status = 'Želim';
    if (!updated.id) updated.id = updated.kind[0] + '-custom-' + (globalThis.crypto?.randomUUID?.() || (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)));
    const arr = updated.kind === 'bottle' ? catalog.bottles : catalog.testers, idx = arr.findIndex(x => x.id === updated.id);
    if (idx < 0) arr.unshift(updated); else arr[idx] = updated;
    if (persist()) {render(); closeModal(); toast('Miris je spremljen');}
  };
  document.querySelector('#overlay').classList.add('open'); document.querySelector('#overlay').setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
  form.querySelector('[name="brand"]').focus();
}
function deleteItem(item) {if (!confirm('Trajno izbrisati ' + item.brand + ' ' + item.name + '? Ako ga želiš samo maknuti iz kolekcije, odaberi „Imao”.')) return; const k = item.kind === 'bottle' ? 'bottles' : 'testers'; catalog[k] = catalog[k].filter(x => x.id !== item.id); catalog.deletedIds = [...new Set([...(catalog.deletedIds || []), item.id])]; if (persist()) {render(); closeModal(); toast('Miris izbrisan');} }
function downloadFile(name, text, mime) {const blob = new Blob([text], {type: mime}), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 3500);}
function exportBackup() {downloadFile('moj-mirisni-arhiv-backup-v4.json', JSON.stringify({...catalog, version: 4, exportedAt: new Date().toISOString()}, null, 2), 'application/json'); toast('Backup preuzet');}
function exportCSV() {
  const cols = ['brand', 'name', 'kind', 'ownership', 'ml', 'capacity', 'count', 'family', 'category', 'status', 'frRating', 'personalRating', 'price2', 'price5', 'price10', 'salePrice', 'targetPrice', 'saleRange', 'description', 'review', 'image', 'frUrl']; const head = ['Brend', 'Parfem', 'Vrsta', 'Vlasništvo', 'Preostalo ml', 'Bočica ml', 'Broj', 'Skupina', 'Kategorija', 'Status', 'Fragrantica', 'Moja ocjena', 'DKNT 2ml', 'DKNT 5ml', 'DKNT 10ml', 'Prodajna cijena', 'Ciljana cijena', 'Procjena', 'Opis', 'Bilješke', 'Slika', 'Fragrantica URL'];
  let rows = [head.map(v => '"' + v.replace(/"/g, '""') + '"').join(';')]; for (const i of active()) rows.push(cols.map(k => '"' + String(k === 'image' && String(i.image || '').startsWith('data:') ? '[slika je u JSON backupu]' : i[k] ?? '').replace(/"/g, '""') + '"').join(';'));
  downloadFile(tabInfo[tab].hash + '.csv', '\ufeff' + rows.join('\r\n'), 'text/csv;charset=utf-8'); toast('CSV preuzet');
}
function importBackup(ev) {
  const file = ev.target.files?.[0]; ev.target.value = ''; if (!file) return;
  const reader = new FileReader(); reader.onload = () => {try {let data = JSON.parse(reader.result); if (!Array.isArray(data.bottles) || !Array.isArray(data.testers)) throw new Error('Neispravan format backupa.'); if (!confirm('Uvoz će zamijeniti trenutni popis u ovom pregledniku. Nastaviti?')) return; catalog = mergeCatalog(data, !data.version || data.version < 4); if (persist()) {render(); toast('Backup uspješno uvezen');} } catch (err) {alert('Ne mogu uvesti backup: ' + err.message);} }; reader.readAsText(file);
}
function resetCatalog() {if (!confirm('Vratiti početni arhiv? Ovo će izbrisati sve tvoje naknadne unose, fotografije, ocjene i izmjene ako nemaš backup.')) return; if (!confirm('Jesi li siguran?')) return; catalog = clone(initial); if (persist()) {render(); toast('Početni arhiv vraćen');} }
async function copyList() {const text = active().map(i => `${i.brand} ${i.name} · ${amMl(i)}${i.kind === 'bottle' ? ` · 2/5/10 ml: ${euro(i.price2)}/${euro(i.price5)}/${euro(i.price10)}` : ''}`).join('\n'); try {await navigator.clipboard.writeText(text); toast('Popis kopiran');} catch (_) {const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); toast('Popis kopiran');} }
function init() {
  for (const [name, meta, label, icon, count] of [['bottles', tabInfo.bottles, 'Parfemi', ICONS.bottle, 'bcount'], ['testers', tabInfo.testers, 'Testeri', ICONS.vial, 'tcount'], ['past', tabInfo.past, 'Imao', ICONS.history, 'hcount'], ['wish', tabInfo.wish, 'Želim', ICONS.heart, 'wcount']]) {
    const el = document.getElementById(meta.nav); el.dataset.view = name; el.innerHTML = icon + `<span>${label}</span><em id="${count}">0</em>`; el.addEventListener('click', () => switchTab(name));
  }
  document.querySelector('#addBtn').innerHTML = ICONS.plus + '<span>Dodaj</span>';
  document.querySelector('#exportBtn').innerHTML = ICONS.download + '<span>Backup JSON</span>';
  document.querySelector('#importBtn').innerHTML = ICONS.import + '<span>Uvezi</span>';
  document.querySelector('#searchIcon').innerHTML = ICONS.search;
  document.querySelector('#familyFilter').innerHTML = options(families, 'Sve skupine');
  document.querySelector('#statusFilter').innerHTML = options(statuses, 'Svi statusi');
  document.querySelector('#sortFilter').innerHTML = '<option value="default">Početni redoslijed</option><option value="name">Naziv A–Z</option><option value="fr">Fragrantica ↓</option><option value="personal">Moja ocjena ↓</option><option value="ml">Količina ↓</option><option value="unrated">Neocijenjeni prvi</option>';
  document.querySelector('#searchInput').addEventListener('input', ev => {search = ev.target.value.trim().toLocaleLowerCase('hr'); renderCards();});
  document.querySelector('#familyFilter').addEventListener('change', ev => {filterFamily = ev.target.value; renderCards();});
  document.querySelector('#statusFilter').addEventListener('change', ev => {filterStatus = ev.target.value; renderCards();});
  document.querySelector('#sortFilter').addEventListener('change', ev => {sortBy = ev.target.value; renderCards();});
  document.querySelector('#addBtn').addEventListener('click', () => openEdit(null));
  document.querySelector('#exportBtn').addEventListener('click', exportBackup);
  document.querySelector('#importBtn').addEventListener('click', () => document.querySelector('#importFile').click());
  document.querySelector('#importFile').addEventListener('change', importBackup);
  document.querySelector('#csvBtn').addEventListener('click', exportCSV);
  document.querySelector('#copyBtn').addEventListener('click', copyList);
  document.querySelector('#resetBtn').addEventListener('click', resetCatalog);
  document.querySelector('#backupFooter').addEventListener('click', ev => {ev.preventDefault(); exportBackup();});
  document.querySelector('#modalClose').addEventListener('click', closeModal);
  document.querySelector('#overlay').addEventListener('click', ev => {if (ev.target.id === 'overlay') closeModal();});
  window.addEventListener('keydown', ev => {if (ev.key === 'Escape') closeModal();});
  window.addEventListener('hashchange', () => switchTab(tabFromHash(), false));
  switchTab(tab, false);
}
init();
