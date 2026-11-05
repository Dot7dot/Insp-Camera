// Insp Camera — capture, sort and revisit inspiration.
// Everything stays in this browser (IndexedDB). No uploads, no accounts.

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const app = $('#app');
const dialog = $('#dialog');
const toastEl = $('#toast');
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => motionQuery.matches;

/* --------------------------------------------------------------------------
   Icons
   -------------------------------------------------------------------------- */

const paths = {
  camera: '<path d="M4 7h3.2l1.6-2.4h6.4L16.8 7H20a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 4 7Z"/><circle cx="12" cy="13" r="3.8"/><path d="M18 10h.01"/>',
  album: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 3v18M11 8h6M11 12h6M11 16h4"/>',
  folder: '<path d="M3 7.5V6a1.5 1.5 0 0 1 1.5-1.5h4.6l2 2.5h8.4A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-10Z"/><path d="M3 9.5h18"/>',
  back: '<path d="m11 5-7 7 7 7M4.5 12H20"/>', right: '<path d="m9 5 7 7-7 7"/>', left: '<path d="m15 5-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>', import: '<path d="M20 13v5.5A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-11A2.5 2.5 0 0 1 6.5 5H11"/><path d="m4 17 4.5-4.5 3.5 3.5 2-2 3 3"/><path d="M18 2.5v7M14.5 6h7"/>',
  download: '<path d="M12 3v12m-4.5-4.5L12 15l4.5-4.5M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="m3 17 5-5 4 4 3.5-3.5L21 18"/>',
  crop: '<path d="M7 2v15h15M2 7h15v15"/>', rotate: '<path d="M4 11a8 8 0 1 1 2.3 5.7M4 5v6h6"/>',
  edit: '<path d="m14.5 5.5 4 4M4 20l4.5-1L20 7.5a2.1 2.1 0 0 0-3-3L5.5 15.5 4 20Z"/>',
  trash: '<path d="M3.5 6h17M9 6V3.5h6V6M5.5 6l1 14.5h11l1-14.5M10 10.5v6M14 10.5v6"/>',
  reset: '<path d="M4 11a8 8 0 1 1 2.3 5.7M4 5v6h6"/><path d="M12 9v3l2 1.5"/>',
  move: '<path d="M3 7.5V6a1.5 1.5 0 0 1 1.5-1.5h4.6l2 2.5h8.4A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-10Z"/><path d="M9 13.5h7m-2.5-2.5 2.5 2.5-2.5 2.5"/>',
  flip: '<path d="M20 9a8 8 0 0 0-14.3-3M4 15a8 8 0 0 0 14.3 3"/><path d="M20 4v5h-5M4 20v-5h5"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  share: '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4.2M8.2 13.2l7.6 4.2"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
  focus: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 20.5h8"/>',
  sparkle: '<path d="M12 3c.6 4.2 2.4 6.1 6.6 6.8-4.2.7-6 2.6-6.6 6.8-.6-4.2-2.4-6.1-6.6-6.8C9.6 9.1 11.4 7.2 12 3Z"/><path d="M19 15.5c.3 1.7 1 2.5 2.6 2.8-1.6.3-2.3 1.1-2.6 2.8-.3-1.7-1-2.5-2.6-2.8 1.6-.3 2.3-1.1 2.6-2.8Z"/>',
  zoomIn: '<circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M20.5 20.5 16 16"/>',
  zoomOut: '<circle cx="11" cy="11" r="7"/><path d="M8 11h6M20.5 20.5 16 16"/>',
  note: '<path d="M6 3.5h9l4 4V20a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 20V3.5Z"/><path d="M9.5 11h6M9.5 15h4"/>',
  export: '<path d="M12 14V3m-4 4 4-4 4 4"/><path d="M8.5 10H6a1.5 1.5 0 0 0-1.5 1.5v8A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 18 10h-2.5"/>',
  saveImg: '<path d="M20 12.5V18.5A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-11A2.5 2.5 0 0 1 6.5 5H11"/><path d="m4 17 4.5-4.5 3.5 3.5 2-2 3 3"/><path d="M18 3v7m-3-3 3 3 3-3"/>',
  install: '<path d="M12 3v11m-4-4 4 4 4-4"/><rect x="4" y="17" width="16" height="4" rx="1.5"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.image}</svg>`;

/* --------------------------------------------------------------------------
   Helpers + state
   -------------------------------------------------------------------------- */

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => crypto.randomUUID();
const pad2 = n => String(n).padStart(2, '0');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const wait = ms => new Promise(r => setTimeout(r, ms));
const fmtDate = (t, opts = { year: 'numeric', month: 'short', day: 'numeric' }) => new Date(t).toLocaleDateString('zh-TW', opts);
const haptic = pattern => { try { navigator.vibrate?.(pattern); } catch { /* unsupported */ } };
const safeName = s => String(s || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-').trim().slice(0, 80) || 'Insp-Camera';
function fmtBytes(b) {
  if (!b) return '0 MB';
  const mb = b / 1048576;
  if (mb < 1) return Math.max(1, Math.round(b / 1024)) + ' KB';
  if (mb < 1024) return mb.toFixed(mb < 10 ? 1 : 0) + ' MB';
  return (mb / 1024).toFixed(1) + ' GB';
}

const MAX_FOLDERS = 12;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif'];
const initialFolders = ['空間', '光影', '質感', '物件', '色彩', '日常'].map((name, i) => ({ id: 'f' + i, name }));

let db, folders = [], photos = [], view = 'home', folderId = 'f0', index = 0, layout = 'stage';
let stream = null, pending = null, busy = false, cameraError = '', cameraStarting = false, facing = 'environment', multiCam = false, routeVersion = 0;
let toastTimer, toastAction = null, afterFolderSave = null, cropState = null, dialogCloseTimer;
let navDir = 0, suppressClickUntil = 0, installPrompt = null, persistAsked = false;
const noteTimers = new Map();
const blobURL = new Map();
const fileCache = new Map();
// Phones save to the photo album through the system share sheet ("Save Image"); computers download.
const fileShare = (() => { try { return !!navigator.canShare?.({ files: [new File([new Uint8Array(1)], 'x.jpg', { type: 'image/jpeg' })] }); } catch { return false; } })();
const toAlbum = () => fileShare && matchMedia('(pointer: coarse)').matches;

const folderById = id => folders.find(f => f.id === id);
const folderIndex = id => folders.findIndex(f => f.id === id);
const flavor = id => 'flavor-' + (Math.max(0, folderIndex(id)) % 6);
const countIn = id => photos.filter(p => p.folderId === id).length;
const byNewest = (a, b) => b.created - a.created;
const folderPhotos = () => photos.filter(p => p.folderId === folderId).sort(byNewest);
function current() { const list = folderPhotos(); index = clamp(index, 0, Math.max(0, list.length - 1)); return list[index]; }
function latestPhoto() { const sorted = [...photos].sort(byNewest); return sorted.find(p => !p.demo) || sorted[0]; }

function photoSrc(p) {
  if (p.blob) {
    if (!blobURL.has(p.id)) blobURL.set(p.id, URL.createObjectURL(p.blob));
    return blobURL.get(p.id);
  }
  return p.src;
}
function invalidate(p) { fileCache.delete(p.id); if (blobURL.has(p.id)) { URL.revokeObjectURL(blobURL.get(p.id)); blobURL.delete(p.id); } }
async function photoBlob(p) { return p.blob || await (await fetch(p.src)).blob(); }

/* --------------------------------------------------------------------------
   Storage
   -------------------------------------------------------------------------- */

function openDB() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('insp-camera:' + new URL('.', location.href).pathname, 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('photos', { keyPath: 'id' }); r.result.createObjectStore('settings'); };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
function request(store, mode, run) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode), r = run(tx.objectStore(store));
    let value;
    r.onsuccess = () => { value = r.result; };
    tx.oncomplete = () => resolve(value);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
function transaction(stores, run) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, 'readwrite');
    run(tx);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
const getSetting = key => request('settings', 'readonly', s => s.get(key));
const setSetting = (key, value) => request('settings', 'readwrite', s => s.put(value, key));
const saveFolders = () => setSetting('folders', folders);
const rememberFolder = () => setSetting('lastFolder', folderId).catch(() => {});
const savePhoto = p => request('photos', 'readwrite', s => s.put(p));
// Read-modify-write inside one transaction. Re-storing a Blob that was read out earlier can fail on
// iOS Safari, so edits always start from the record as it is stored right now.
function patchPhoto(id, mutate) {
  let updated = null;
  return transaction(['photos'], tx => {
    const store = tx.objectStore('photos'), r = store.get(id);
    r.onsuccess = () => { if (!r.result) return; updated = r.result; mutate(updated); store.put(updated); };
  }).then(() => { if (!updated) throw new Error('missing'); return updated; });
}
function moveRecords(tx, matches, to) {
  const r = tx.objectStore('photos').openCursor();
  r.onsuccess = () => {
    const c = r.result;
    if (!c) return;
    if (matches(c.value)) { const v = c.value; v.folderId = to; c.update(v); }
    c.continue();
  };
}

function persistStorage() {
  if (persistAsked) return;
  persistAsked = true;
  Promise.resolve(navigator.storage?.persist?.()).catch(() => {});
}
async function updateStorageNote() {
  const el = $('#storage-usage');
  if (!el || !navigator.storage?.estimate) return;
  try {
    const { usage } = await navigator.storage.estimate();
    const persisted = await Promise.resolve(navigator.storage.persisted?.()).catch(() => false);
    if (el.isConnected) el.textContent = `目前約使用 ${fmtBytes(usage)}${persisted ? ' · 已啟用持久儲存' : ''}`;
  } catch { /* estimate unavailable */ }
}

/* --------------------------------------------------------------------------
   Feedback: toast, jelly, haptics
   -------------------------------------------------------------------------- */

function toast(msg, opts = {}) {
  clearTimeout(toastTimer);
  const host = dialog.open ? dialog : document.body;
  if (toastEl.parentNode !== host) host.append(toastEl);
  toastAction = opts.action || null;
  toastEl.innerHTML = `<span class="toast-msg">${icon(opts.icon || 'check')}<span>${esc(msg)}</span></span>${opts.label ? `<button class="toast-btn j" data-action="toast-action">${esc(opts.label)}</button>` : ''}`;
  toastEl.classList.toggle('has-action', !!opts.label);
  toastEl.classList.remove('visible');
  void toastEl.offsetWidth;
  toastEl.classList.add('visible');
  toastTimer = setTimeout(hideToast, opts.duration || (opts.label ? 5200 : 2800));
}
function hideToast() { clearTimeout(toastTimer); toastEl.classList.remove('visible'); toastAction = null; }
function warn(msg) {
  if (!dialog.open) { toast(msg, { icon: 'close' }); return; }
  let alert = $('#dialog-alert', dialog);
  if (!alert) {
    alert = document.createElement('p');
    alert.id = 'dialog-alert';
    alert.className = 'field-error dialog-alert';
    alert.setAttribute('role', 'alert');
    const actions = $('.dialog-actions', dialog);
    actions ? actions.before(alert) : dialog.append(alert);
  }
  alert.textContent = msg;
  shake(alert);
}

function jelly(el) {
  if (!el || !el.classList.contains('j') || reduced()) return;
  el.classList.remove('jelly-play');
  void el.offsetWidth;
  el.classList.add('jelly-play');
}
document.addEventListener('animationend', e => {
  if (e.animationName === 'jelly') e.target.classList.remove('jelly-play');
  if (e.animationName === 'gulp') e.target.classList.remove('gulp');
  if (e.animationName === 'shake') e.target.classList.remove('shake');
});
function shake(el) { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); haptic(30); }

document.addEventListener('pointerdown', e => {
  const el = e.target.closest('.j');
  if (el && !el.disabled) el.classList.add('pressed');
}, { passive: true });
const release = () => $$('.j.pressed').forEach(el => el.classList.remove('pressed'));
['pointerup', 'pointercancel', 'dragstart'].forEach(t => document.addEventListener(t, release, { passive: true }));
document.addEventListener('pointerout', e => { if (e.target.closest?.('.j') && !e.relatedTarget?.closest?.('.j.pressed')) e.target.closest('.j').classList.remove('pressed'); }, { passive: true });

/* --------------------------------------------------------------------------
   Routing (history-aware so the phone's back button works)
   -------------------------------------------------------------------------- */

const titles = { home: 'Insp Camera', camera: 'Capture — Insp Camera', album: 'Collection — Insp Camera' };
function routeFromHash() { const h = location.hash.slice(1); return h === 'camera' || h === 'album' ? h : 'home'; }
function urlFor(v) { return v === 'home' ? location.pathname + location.search : '#' + v; }

function go(next) {
  if (next === view) { render(); return; }
  if (next === 'home' && history.state?.prev === 'home' && !history.state?.viewer) { history.back(); return; }
  history.pushState({ view: next, prev: view }, '', urlFor(next));
  show(next);
}
function show(next) {
  routeVersion++;
  if (next !== 'camera') { stopCamera(); clearPending(); cameraStarting = false; }
  if (dialog.open) dialog.close();
  if (toastAction) hideToast();
  view = next;
  navDir = 0;
  if (next === 'camera') cameraStarting = !stream && !pending;
  document.body.dataset.view = next;
  document.title = titles[next];
  render();
  app.firstElementChild?.classList.add('enter');
  window.scrollTo(0, 0);
  if (next === 'camera') startCamera();
}
addEventListener('popstate', e => {
  const st = e.state || {};
  if (viewer.open && !st.viewer) closeViewer(true);
  const v = st.view || routeFromHash();
  if (v !== view) show(v);
});

function render() {
  if (view === 'home') renderHome();
  else if (view === 'camera') renderCamera();
  else renderAlbum();
}

function openPhoto(id) {
  const p = photos.find(x => x.id === id);
  if (!p) return;
  folderId = p.folderId;
  index = Math.max(0, folderPhotos().findIndex(x => x.id === id));
  navDir = 0;
  go('album');
}

/* --------------------------------------------------------------------------
   Shared markup
   -------------------------------------------------------------------------- */

const brand = () => '<span class="wordmark">Insp <em>Camera</em><i></i></span>';
function iconBtn(action, name, label, extra = '', cls = '') {
  return `<button class="icon-btn j ${cls}" data-action="${action}" title="${label}" aria-label="${label}" ${extra}>${icon(name)}</button>`;
}
function topbar(title, sub, actions = '') {
  return `<header class="bar">${iconBtn('home', 'back', '回到首頁')}<span class="wordmark-slot">${brand()}</span><div class="bar-title"><h1>${title}</h1><span>${sub}</span></div><div class="bar-actions">${actions}</div></header>`;
}

/* --------------------------------------------------------------------------
   Home
   -------------------------------------------------------------------------- */

function renderHome() {
  const mine = photos.filter(p => !p.demo).length;
  const recent = [...photos].sort(byNewest).slice(0, 12);
  const preview = recent.slice(0, 3);
  app.innerHTML = `<div class="shell home">
    <header class="home-top">${brand()}<span class="status-chip"><i></i>本機儲存 · 無需帳號</span></header>
    <section class="hero">
      <p class="eyebrow">Notice · Capture · Keep</p>
      <h1>Good ideas begin<br>with a little <em>noticing.</em></h1>
      <p class="hero-sub">把靈感，留在看見的那一刻。</p>
    </section>
    <section class="entries" aria-label="開始使用">
      <button class="entry entry-capture j" data-action="camera">
        <span class="orb">${icon('camera')}</span>
        <span class="entry-text"><strong>Capture</strong><small>捕捉一個靈感</small></span>
        <span class="entry-go">${icon('right')}</span>
      </button>
      <button class="entry entry-collection j" data-action="album">
        <span class="mosaic ${preview.length ? '' : 'empty'}">${preview.length ? preview.map(p => `<img src="${photoSrc(p)}" alt="" loading="lazy">`).join('') : icon('album')}</span>
        <span class="entry-text"><strong>Collection</strong><small>重溫我的收藏 · ${photos.length} 張</small></span>
        <span class="entry-go">${icon('right')}</span>
      </button>
    </section>
    ${recent.length ? `<section class="recent">
      <div class="section-head"><h2>最近的靈感</h2><button class="link-btn" data-action="album">查看全部</button></div>
      <div class="recent-strip">${recent.map(p => `<button class="recent-item j" data-action="open-photo" data-id="${esc(p.id)}" aria-label="查看「${esc(p.name)}」"><img src="${photoSrc(p)}" alt="" loading="lazy"><span>${esc(folderById(p.folderId)?.name || '')}</span></button>`).join('')}</div>
    </section>` : ''}
    <footer class="home-foot">
      <span><b>${pad2(mine)}</b> 個靈感 · <b>${pad2(folders.length)}</b> 個資料夾</span>
      <span>照片與筆記只存在此裝置 · <a href="./privacy.html">隱私</a>${installPrompt ? ' · <button class="link-btn" data-action="install">安裝 App</button>' : ''}</span>
    </footer>
  </div>`;
}

/* --------------------------------------------------------------------------
   Capture
   -------------------------------------------------------------------------- */

// Divide the outer U-shaped frame by its perimeter length; one folder remains a single surface.
function folderSegments(count) {
  if (count < 1) return [];
  if (count === 1) return [{ side: 'single', start: 0, end: 1 }];
  if (count === 2) return [{ side: 'left-half', start: 0, end: 1 }, { side: 'right-half', start: 0, end: 1 }];
  const sides = ['left', 'top', 'right'];
  const per = [Math.floor(count / 3), Math.floor(count / 3), Math.floor(count / 3)];
  for (let i = 0; i < count % 3; i++) per[i === 0 ? 1 : 0]++;
  return sides.flatMap((side, j) => Array.from({ length: per[j] }, (_, i) => ({ side, start: i / per[j], end: (i + 1) / per[j] })));
}
function cellStyle({ side, start, end }) {
  if (side === 'single') return 'inset:0';
  if (side === 'left-half') return 'left:0;top:0;width:50%;height:100%';
  if (side === 'right-half') return 'left:50%;top:0;width:50%;height:100%';
  if (side === 'top') return `left:${start * 100}%;top:0;width:${(end - start) * 100}%;height:17%`;
  return `left:${side === 'left' ? 0 : 79}%;top:${17 + start * 83}%;width:21%;height:${(end - start) * 83}%`;
}
function folderCells() {
  const segs = folderSegments(folders.length);
  return folders.map((f, i) => {
    const n = countIn(f.id), sel = f.id === folderId;
    return `<button class="folder-cell j flavor-${i % 6} side-${segs[i].side} ${sel ? 'selected' : ''}" style="${cellStyle(segs[i])};--i:${i}" data-action="choose-folder" data-id="${esc(f.id)}" aria-label="${pending ? '儲存到' : '選擇'}「${esc(f.name)}」，${n} 張照片" aria-pressed="${sel}">
      <span class="juice">${i < 9 ? `<kbd>${i + 1}</kbd>` : ''}<span class="juice-check">${icon('check')}</span><span class="juice-body"><span class="juice-icon">${icon('folder')}</span><span class="juice-name">${esc(f.name)}</span><small class="juice-count">${n}</small></span></span>
    </button>`;
  }).join('');
}
function viewfinderInner() {
  if (pending) return `<img class="pending-img" src="${pending.url}" alt="剛拍攝的照片預覽">`;
  const video = `<video class="${facing === 'user' ? 'mirror' : ''}" autoplay muted playsinline ${stream ? '' : 'hidden'}></video>`;
  if (stream) return `${video}<span class="vf-grid" aria-hidden="true"></span><span class="vf-corner" aria-hidden="true"></span>${multiCam ? `<button class="vf-btn j" data-action="flip-camera" aria-label="切換前後鏡頭" title="切換鏡頭">${icon('flip')}</button>` : ''}`;
  if (cameraStarting) return `${video}<div class="vf-empty"><span class="spinner" aria-hidden="true"></span><p>正在開啟相機…</p></div>`;
  return `${video}<div class="vf-empty">${icon('camera')}<p>${esc(cameraError || '開啟相機，留住眼前的靈感。')}</p><div class="vf-empty-actions">${cameraError
    ? `<button class="btn-jelly sm j" data-action="native-camera">${icon('camera')}使用手機相機</button><button class="btn-ghost sm j" data-action="start-camera">重試</button>`
    : `<button class="btn-jelly sm j" data-action="start-camera">啟用相機</button>`}</div></div>`;
}
function renderCamera() {
  const f = folderById(folderId) || folders[0];
  const last = latestPhoto();
  const status = pending ? '<i class="pulse"></i>點選資料夾，收藏這一刻'
    : stream ? '<i class="rec"></i>Live · See something good?'
    : cameraStarting ? '正在開啟相機…' : 'See something good?';
  app.innerHTML = `<div class="shell camera-page">
    ${topbar('Capture', 'Follow your curiosity', `<button class="pill j" data-action="folders">${icon('folder')}<span>資料夾</span></button>`)}
    <div class="camera-layout">
      <section class="camera-main" aria-label="相機">
        <div class="camera-status">
          <span class="status-text ${pending ? 'is-pending' : ''}" aria-live="polite">${status}</span>
          <span class="target-chip">存入 <i class="chip-dot ${flavor(f.id)}" id="target-dot"></i><b id="target-name">${esc(f.name)}</b></span>
        </div>
        <div class="camera-frame ${pending ? 'is-pending' : ''}">
          ${folderCells()}
          <div class="viewfinder">
            ${viewfinderInner()}
            <span class="vf-flash" aria-hidden="true"></span>
            <span class="vf-meta"><i class="live-dot"></i>${pending ? 'A LITTLE INSPIRATION' : stream ? (facing === 'user' ? 'FRONT' : 'BACK') + ' · INSP CAMERA' : 'INSP CAMERA'}</span>
          </div>
        </div>
        <div class="camera-controls">
          ${pending
            ? `<button class="ctrl j" data-action="retake" aria-label="重新拍攝"><span class="ctrl-face">${icon('reset')}</span>重拍</button>`
            : `<button class="ctrl j" data-action="camera-last" aria-label="${last ? '查看最新的照片' : '開啟收藏'}"><span class="ctrl-face ${last ? 'thumb' : ''}">${last ? `<img src="${photoSrc(last)}" alt="">` : icon('album')}</span>收藏</button>`}
          <button class="shutter j ${pending ? 'is-pending' : ''}" data-action="shutter" aria-label="${pending ? `儲存到「${esc(f.name)}」` : '拍照'}"><span class="shutter-core">${pending ? icon('check') : ''}</span></button>
          ${pending
            ? `<button class="ctrl j" data-action="pending-new-folder" aria-label="存到新的資料夾" ${folders.length >= MAX_FOLDERS ? 'disabled' : ''}><span class="ctrl-face">${icon('plus')}</span>新資料夾</button>`
            : `<button class="ctrl j" data-action="import" aria-label="從裝置匯入照片"><span class="ctrl-face">${icon('image')}</span>匯入</button>`}
        </div>
        <p class="camera-hint" id="camera-hint">${pending ? `點四周的果汁資料夾直接收藏，或按 ✓ 存入「<b>${esc(f.name)}</b>」` : '拍下照片，再點四周的資料夾收藏'}</p>
      </section>
      <aside class="camera-side">
        <span class="side-num">01<i>/</i></span>
        <p class="eyebrow" style="margin-top:20px">The everyday is full of ideas</p>
        <h2>A moment.<br>A spark.<br><em>Something to keep.</em></h2>
        <p>一面牆的色彩、一束午後的光，或是剛好路過的美好。拍下來，放進屬於它的資料夾。</p>
        <ol class="steps"><li><span>1</span>拍下靈感</li><li><span>2</span>點選四周的果汁資料夾</li><li><span>3</span>到 Collection 重溫與寫筆記</li></ol>
        <div class="shortcuts"><p class="eyebrow">鍵盤快捷鍵</p><dl>
          <dt><kbd>Space</kbd></dt><dd>拍照 / 存入選取的資料夾</dd>
          <dt><kbd>1</kbd> – <kbd>${Math.min(9, folders.length)}</kbd></dt><dd>選擇或直接存入資料夾</dd>
          <dt><kbd>Esc</kbd></dt><dd>重新拍攝</dd>
        </dl></div>
        <p class="side-foot">${folders.length} 個資料夾，隨你的靈感自由擴充。照片只會儲存在這個瀏覽器。</p>
      </aside>
    </div>
  </div>`;
  attachStream();
}
function attachStream() {
  const video = $('.viewfinder video');
  if (stream && video) { video.srcObject = stream; video.play().catch(() => {}); }
}
function stopCamera() { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } }
function clearPending() { if (pending) URL.revokeObjectURL(pending.url); pending = null; }

async function startCamera() {
  if (view !== 'camera' || pending || stream) { cameraStarting = false; return; }
  const version = routeVersion;
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('unavailable');
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 2560 } }, audio:false });
    if (view !== 'camera' || routeVersion !== version || pending || stream) { s.getTracks().forEach(t => t.stop()); return; }
    stream = s;
    cameraError = '';
    s.getVideoTracks()[0]?.addEventListener('ended', () => {
      if (stream !== s) return;
      stream = null;
      cameraError = '相機連線已中斷，請重試或改用匯入照片。';
      if (view === 'camera') renderCamera();
    });
    try { multiCam = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput').length > 1; } catch { multiCam = false; }
  } catch (e) {
    if (view !== 'camera' || routeVersion !== version) return;
    cameraError = e.name === 'NotAllowedError' ? '相機權限未開啟。你可以改用手機相機，或匯入照片。'
      : e.name === 'NotFoundError' ? '找不到可用的相機，可以改用匯入照片。'
      : '無法啟用即時相機，可使用手機相機或匯入照片。';
  } finally {
    if (view === 'camera' && routeVersion === version) { cameraStarting = false; renderCamera(); }
  }
}
async function flipCamera() {
  facing = facing === 'environment' ? 'user' : 'environment';
  stopCamera();
  cameraStarting = true;
  renderCamera();
  haptic(8);
  await startCamera();
}
function flash() {
  const f = $('.vf-flash');
  if (!f || reduced()) return;
  f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
}
async function capture() {
  if (busy) return;
  if (pending) return storePending();
  const video = $('.viewfinder video');
  if (!stream || !video?.videoWidth) { $('#native-input').click(); return; }
  busy = true;
  try {
    flash();
    haptic(12);
    const c = document.createElement('canvas');
    c.width = video.videoWidth; c.height = video.videoHeight;
    const ctx = c.getContext('2d');
    if (facing === 'user') { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0);
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .92));
    if (!blob) throw new Error('capture');
    pending = { blob, url: URL.createObjectURL(blob) };
    busy = false;
    renderCamera();
  } catch {
    warn('拍攝失敗，請再試一次');
  } finally { busy = false; }
}
function flyTo(fromEl, toEl) {
  if (!fromEl || !toEl || reduced() || !fromEl.animate) return Promise.resolve();
  const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
  const ghost = document.createElement('img');
  ghost.src = fromEl.src; ghost.alt = ''; ghost.className = 'fly-ghost';
  Object.assign(ghost.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' });
  document.body.append(ghost);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const k = Math.max(.08, Math.min(b.width / a.width, b.height / a.height) * .7);
  return ghost.animate([
    { transform: 'translate(0,0) scale(1)', borderRadius: '18px', opacity: 1 },
    { transform: `translate(${dx * .35}px,${dy * .35 - 30}px) scale(${.55 + k * .3})`, borderRadius: '28px', opacity: 1, offset: .4 },
    { transform: `translate(${dx}px,${dy}px) scale(${k})`, borderRadius: '50%', opacity: .1 }
  ], { duration: 560, easing: 'cubic-bezier(.45,0,.2,1)' }).finished.catch(() => {}).then(() => ghost.remove());
}
function gulp(id) {
  const cell = $(`.folder-cell[data-id="${CSS.escape(id)}"]`);
  if (!cell || reduced()) return;
  cell.classList.remove('jelly-play', 'gulp'); void cell.offsetWidth; cell.classList.add('gulp');
  const s = document.createElement('i'); s.className = 'splash';
  $('.juice', cell).append(s);
  setTimeout(() => s.remove(), 800);
}
async function storePending(id = folderId) {
  if (!pending || busy) return;
  const f = folderById(id);
  if (!f) return;
  busy = true;
  try {
    const p = { id: uid(), folderId: id, blob: pending.blob, created: Date.now(), note: '', name: '靈感 ' + new Date().toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }), demo: false };
    await savePhoto(p);
    photos.push(p);
    haptic([8, 40, 16]);
    await flyTo($('.viewfinder .pending-img'), $(`.folder-cell[data-id="${CSS.escape(id)}"] .juice`));
    folderId = id;
    clearPending();
    busy = false;
    if (view !== 'camera') return;
    renderCamera();
    gulp(id);
    toast(`已收藏到「${f.name}」`, { label: '查看', action: () => openPhoto(p.id) });
    persistStorage();
    if (!stream && !cameraError) { cameraStarting = true; renderCamera(); startCamera(); }
  } catch {
    warn('儲存失敗，請檢查裝置儲存空間後重試');
  } finally { busy = false; }
}
function selectFolder(id) {
  const f = folderById(id);
  if (!f) return;
  folderId = id;
  rememberFolder();
  haptic(6);
  $$('.folder-cell').forEach(c => { const on = c.dataset.id === id; c.classList.toggle('selected', on); c.setAttribute('aria-pressed', on); });
  const name = $('#target-name'); if (name) name.textContent = f.name;
  const dot = $('#target-dot'); if (dot) dot.className = 'chip-dot ' + flavor(id);
}

/* --------------------------------------------------------------------------
   Collection
   -------------------------------------------------------------------------- */

function renderAlbum() {
  const list = folderPhotos(), p = current(), f = folderById(folderId) || folders[0];
  const demoCount = photos.filter(x => x.demo).length;
  const body = !p ? emptyHTML(f) : layout === 'grid' ? gridHTML(list) : `<div class="album-body">${stageHTML(p, list)}${detailsHTML(p)}</div>`;
  app.innerHTML = `<div class="shell album-page">
    ${topbar('Collection', `${photos.length} moments · ${folders.length} folders`, `<button class="pill pill-accent j" data-action="import">${icon('import')}<span>匯入</span></button>${iconBtn('export', 'export', '匯出照片')}${iconBtn('folders', 'folder', '管理資料夾')}`)}
    <section class="album">
      <nav class="chips" aria-label="資料夾">${folders.map((x, i) => `<button class="chip j ${x.id === folderId ? 'active' : ''}" data-action="album-folder" data-id="${esc(x.id)}" aria-pressed="${x.id === folderId}"><i class="chip-dot flavor-${i % 6}"></i>${esc(x.name)}<small>${pad2(countIn(x.id))}</small></button>`).join('')}${folders.length < MAX_FOLDERS ? `<button class="chip chip-add j" data-action="new-folder" aria-label="新增資料夾" title="新增資料夾">${icon('plus')}</button>` : ''}</nav>
      ${demoCount ? `<div class="demo-banner">${icon('sparkle')}<span>收藏中有 ${demoCount} 張示範照片，隨時可以一鍵清除。</span><button class="link-btn" data-action="clear-samples">清除示範</button></div>` : ''}
      <div class="album-head">
        <h2><span>${esc(f.name)}</span><small>${pad2(list.length)} moments</small></h2>
        ${list.length ? `<div class="seg" role="group" aria-label="檢視方式">
          <button class="seg-btn ${layout === 'stage' ? 'active' : ''}" data-action="layout" data-layout="stage" aria-pressed="${layout === 'stage'}" title="單張檢視">${icon('focus')}<span>單張</span></button>
          <button class="seg-btn ${layout === 'grid' ? 'active' : ''}" data-action="layout" data-layout="grid" aria-pressed="${layout === 'grid'}" title="格狀檢視">${icon('grid')}<span>格狀</span></button>
        </div>` : ''}
      </div>
      ${body}
      <p class="storage-note">所有照片與筆記均儲存在此瀏覽器，尚未提供跨裝置同步。<br>清除網站資料會移除收藏；請下載重要照片備份。<br><span id="storage-usage"></span><br><a href="./privacy.html">隱私與安全說明</a></p>
    </section>
  </div>`;
  if (p && layout === 'stage') { bindNote(p); bindStage(); centerIn($('.thumbs'), $('.thumb.active')); }
  centerIn($('.chips'), $('.chip.active'));
  updateStorageNote();
}
function centerIn(container, el) {
  if (!container || !el) return;
  container.scrollLeft = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
}
function stageHTML(p, list) {
  const dirClass = navDir > 0 ? 'from-right' : navDir < 0 ? 'from-left' : 'fade';
  const pct = list.length > 1 ? (index / (list.length - 1)) * 100 : 0;
  const tool = (action, name, label, extra = '', cls = '') => `<button class="tool j ${cls}" data-action="${action}" aria-label="${label}" title="${label}" ${extra}>${icon(name)}<span>${label}</span></button>`;
  return `<div class="stage-wrap">
    <div class="stage" id="stage">
      ${p.demo ? '<span class="stage-chip stage-badge">SAMPLE · 示範</span>' : ''}
      <button class="stage-open" data-action="open-viewer" aria-label="放大檢視「${esc(p.name)}」"><img id="album-image" class="stage-img ${dirClass}" src="${photoSrc(p)}" alt="${esc(p.name)}" draggable="false"></button>
      <button class="stage-nav prev j" data-action="prev" aria-label="上一張照片" ${index === 0 ? 'disabled' : ''}>${icon('left')}</button>
      <button class="stage-nav next j" data-action="next" aria-label="下一張照片" ${index === list.length - 1 ? 'disabled' : ''}>${icon('right')}</button>
      <span class="stage-chip stage-count">${pad2(index + 1)} / ${pad2(list.length)}</span>
      <span class="stage-chip stage-hint">${icon('expand')}點擊放大</span>
    </div>
    <div class="toolbar" role="toolbar" aria-label="照片工具">
      ${tool('open-viewer', 'expand', '放大', '', 'accent')}
      ${tool('crop', 'crop', '裁切')}
      ${tool('rotate', 'rotate', '旋轉')}
      ${tool('reset-photo', 'reset', '還原', p.originalBlob ? '' : 'disabled')}
      ${tool('save-photo', 'saveImg', '儲存', `title="${toAlbum() ? '存到手機相簿' : '下載照片'}"`)}
    </div>
    ${list.length > 1 ? `<div class="scrub"><span class="photo-counter">${pad2(index + 1)}</span><input id="photo-range" type="range" aria-label="切換照片" min="0" max="${list.length - 1}" value="${index}" style="--p:${pct}%"><span>${pad2(list.length)}</span></div>` : ''}
    <div class="thumbs" aria-label="照片縮圖">${list.map((x, i) => `<button class="thumb ${i === index ? 'active' : ''}" data-action="thumbnail" data-index="${i}" aria-label="第 ${i + 1} 張：${esc(x.name)}" aria-pressed="${i === index}"><img src="${photoSrc(x)}" alt="" loading="lazy"></button>`).join('')}</div>
  </div>`;
}
function detailsHTML(p) {
  const f = folderById(p.folderId);
  return `<section class="details" aria-label="照片資訊與筆記">
    <div class="details-head">
      <h3 class="photo-title"><button class="title-btn" data-action="rename-photo" aria-label="重新命名「${esc(p.name)}」" title="重新命名"><span>${esc(p.name)}</span>${icon('edit')}</button></h3>
      <time datetime="${new Date(p.created).toISOString()}"><i class="chip-dot ${flavor(p.folderId)}"></i>${esc(f?.name || '')} · ${fmtDate(p.created, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</time>
    </div>
    <div class="notes">
      <div class="notes-label"><h4>A note to remember.</h4><span id="note-status" class="note-status">${p.note ? icon('check') + '已儲存' : '自動儲存'}</span></div>
      <p>記下吸引你的細節，留給下一個創作的自己。</p>
      <textarea id="photo-note" aria-label="照片筆記" maxlength="5000" placeholder="這個瞬間，讓你想到了什麼？">${esc(p.note || '')}</textarea>
      <div class="notes-foot"><span id="note-count">${(p.note || '').length} 字</span></div>
    </div>
    <div class="photo-actions">
      <button class="pill j" data-action="move">${icon('move')}移動資料夾</button>
      <button class="pill danger j" data-action="delete">${icon('trash')}刪除</button>
    </div>
  </section>`;
}
function gridHTML(list) {
  return `<div class="grid">${list.map((x, i) => `<button class="tile j" data-action="view" data-index="${i}" aria-label="放大檢視第 ${i + 1} 張：${esc(x.name)}"><span class="tile-in" style="--d:${Math.min(i, 24) * 22}ms"><img src="${photoSrc(x)}" alt="" loading="lazy" draggable="false"><span class="tile-meta"><b>${esc(x.name)}</b><time>${fmtDate(x.created, { month: 'short', day: 'numeric' })}</time></span>${x.note ? `<i class="tile-flag" title="有筆記">${icon('note')}</i>` : ''}${x.demo ? '<i class="tile-demo">SAMPLE</i>' : ''}</span></button>`).join('')}</div>`;
}
function emptyHTML(f) {
  return `<div class="empty">
    <span class="empty-orb">${icon('album')}</span>
    <p class="eyebrow">A fresh little start</p>
    <h2>下一個靈感，就放這裡。</h2>
    <p>「${esc(f.name)}」還沒有照片。<br>打開相機，或從裝置匯入第一個靈感。</p>
    <div class="empty-actions"><button class="btn-jelly j" data-action="camera">${icon('camera')}捕捉靈感</button><button class="btn-ghost j" data-action="import">${icon('import')}匯入照片</button></div>
    <p class="drop-hint">也可以直接把圖片拖曳到視窗中</p>
  </div>`;
}
function changeIndex(n) {
  const list = folderPhotos();
  n = clamp(n, 0, list.length - 1);
  if (n === index || !list.length) return;
  navDir = n > index ? 1 : -1;
  index = n;
  renderAlbum();
  navDir = 0;
}
function bindNote(p) {
  const area = $('#photo-note');
  area.addEventListener('input', () => {
    p.note = area.value;
    const status = $('#note-status');
    status.textContent = '儲存中…';
    status.classList.add('saving');
    $('#note-count').textContent = area.value.length + ' 字';
    clearTimeout(noteTimers.get(p.id));
    noteTimers.set(p.id, setTimeout(async () => {
      try {
        await patchPhoto(p.id, rec => { rec.note = p.note; });
        noteTimers.delete(p.id);
        const s = $('#note-status');
        if (current()?.id === p.id && s) { s.innerHTML = icon('check') + '已儲存'; s.classList.remove('saving'); }
      } catch {
        const s = $('#note-status');
        if (s) { s.textContent = '儲存失敗，請重試'; s.classList.remove('saving'); }
        warn('筆記儲存失敗，請檢查儲存空間');
      }
    }, 400));
  });
}
function flushNotes() {
  for (const [id, timer] of noteTimers) {
    clearTimeout(timer);
    const p = photos.find(x => x.id === id);
    if (p) patchPhoto(id, rec => { rec.note = p.note; }).catch(() => {});
    noteTimers.delete(id);
  }
}
// Horizontal swipe on the stage moves between photos; a tap opens the viewer.
function bindStage() {
  const stage = $('#stage'), img = $('#album-image');
  if (!stage || !img) return;
  let s = null;
  stage.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' || e.target.closest('.stage-nav')) return;
    s = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), drag: false };
  });
  stage.addEventListener('pointermove', e => {
    if (!s || e.pointerId !== s.id) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (!s.drag && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) s.drag = true;
    if (s.drag) {
      const edge = (dx > 0 && index === 0) || (dx < 0 && index === folderPhotos().length - 1);
      img.style.transition = 'none';
      img.style.transform = `translateX(${dx * (edge ? .25 : .6)}px) rotate(${dx * .01}deg)`;
    }
  });
  const end = e => {
    if (!s || e.pointerId !== s.id) return;
    const dx = e.clientX - s.x, v = Math.abs(dx) / (performance.now() - s.t);
    const dragged = s.drag;
    s = null;
    img.style.transition = '';
    img.style.transform = '';
    if (!dragged) return;
    suppressClickUntil = performance.now() + 400;
    if (e.type === 'pointerup' && (Math.abs(dx) > 60 || v > .45)) { haptic(6); changeIndex(index + (dx < 0 ? 1 : -1)); }
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
}

/* --------------------------------------------------------------------------
   Viewer (tap a photo to see it full screen: pinch, double-tap, swipe)
   -------------------------------------------------------------------------- */

const viewer = { open: false, list: [], i: 0, start: 0, s: 1, x: 0, y: 0, pointers: new Map(), g: null, lastTap: null, tapTimer: 0, busy: false, returnFocus: null };
let vEl, vImg, vStage;

function buildViewer() {
  vEl = document.createElement('div');
  vEl.className = 'viewer';
  vEl.hidden = true;
  vEl.setAttribute('role', 'dialog');
  vEl.setAttribute('aria-modal', 'true');
  vEl.setAttribute('aria-label', '照片檢視器');
  vEl.innerHTML = `<div class="viewer-backdrop"></div>
    <div class="viewer-stage" id="v-stage"><img id="v-img" alt="" draggable="false"></div>
    <div class="viewer-top">
      <div class="viewer-title"><strong id="v-name"></strong><span id="v-meta"></span></div>
      <button class="v-btn j" data-action="lb-zoom" id="v-zoom-btn" aria-label="放大" title="放大">${icon('zoomIn')}</button>
      ${navigator.share ? `<button class="v-btn j" data-action="lb-share" aria-label="分享" title="分享">${icon('share')}</button>` : ''}
      <button class="v-btn j" data-action="lb-save" aria-label="${toAlbum() ? '存到相簿' : '下載'}" title="${toAlbum() ? '存到相簿' : '下載'}">${icon('saveImg')}</button>
      <button class="v-btn j" data-action="lb-edit" aria-label="筆記與編輯" title="筆記與編輯">${icon('edit')}</button>
      <button class="v-btn close j" data-action="lb-close" id="v-close" aria-label="關閉檢視器" title="關閉 (Esc)">${icon('close')}</button>
    </div>
    <button class="v-btn viewer-nav prev j" data-action="lb-prev" aria-label="上一張">${icon('left')}</button>
    <button class="v-btn viewer-nav next j" data-action="lb-next" aria-label="下一張">${icon('right')}</button>
    <div class="viewer-bottom"><span class="v-count" id="v-count"></span><span class="viewer-hint" id="v-hint"></span><span class="v-zoom" id="v-zoom"></span></div>`;
  document.body.append(vEl);
  vImg = $('#v-img', vEl);
  vStage = $('#v-stage', vEl);
  $('#v-hint', vEl).textContent = matchMedia('(hover: none)').matches ? '雙擊放大 · 左右滑動切換 · 下滑關閉' : '雙擊或滾輪縮放 · ← → 切換 · Esc 關閉';
  vStage.addEventListener('pointerdown', vDown);
  vStage.addEventListener('pointermove', vMove);
  vStage.addEventListener('pointerup', vUp);
  vStage.addEventListener('pointercancel', vUp);
  vStage.addEventListener('wheel', e => { e.preventDefault(); vZoomTo(viewer.s * Math.exp(-e.deltaY * (e.ctrlKey ? .01 : .0025)), e.clientX, e.clientY, false); }, { passive: false });
  addEventListener('resize', () => { if (viewer.open) { vClamp(); vApply(false); } });
}
function vRect() { return vStage.getBoundingClientRect(); }
function vApply(animate) {
  vImg.style.transition = animate && !reduced() ? 'transform .32s cubic-bezier(.2,.8,.2,1)' : 'none';
  vImg.style.transform = `translate3d(${viewer.x}px,${viewer.y}px,0) scale(${viewer.s})`;
  const zoomed = viewer.s > 1.01;
  vEl.classList.toggle('zoomed', zoomed);
  $('#v-zoom').textContent = zoomed ? Math.round(viewer.s * 100) + '%' : '';
  const btn = $('#v-zoom-btn');
  btn.innerHTML = icon(zoomed ? 'zoomOut' : 'zoomIn');
  btn.setAttribute('aria-label', zoomed ? '縮小' : '放大');
}
function vClamp() {
  const r = vRect(), w = vImg.clientWidth * viewer.s, h = vImg.clientHeight * viewer.s;
  const bx = Math.max(0, (w - r.width) / 2), by = Math.max(0, (h - r.height) / 2);
  viewer.x = clamp(viewer.x, -bx, bx);
  viewer.y = clamp(viewer.y, -by, by);
}
function vZoomTo(ns, cx, cy, animate = true) {
  const r = vRect();
  if (cx == null) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
  const px = cx - (r.left + r.width / 2), py = cy - (r.top + r.height / 2);
  ns = clamp(ns, 1, 5);
  const k = ns / viewer.s;
  viewer.x = px - (px - viewer.x) * k;
  viewer.y = py - (py - viewer.y) * k;
  viewer.s = ns;
  if (ns === 1) { viewer.x = 0; viewer.y = 0; }
  vClamp();
  vApply(animate);
}
function vToggleZoom(cx, cy) { if (viewer.s > 1.01) vZoomTo(1); else vZoomTo(2.5, cx, cy); haptic(6); }
function vResetZoom() { viewer.s = 1; viewer.x = 0; viewer.y = 0; }

function vDown(e) {
  if (e.button > 0) return;
  vStage.setPointerCapture(e.pointerId);
  viewer.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (viewer.pointers.size === 1) {
    viewer.g = { mode: null, sx: e.clientX, sy: e.clientY, x0: viewer.x, y0: viewer.y, t: performance.now(), moved: false, type: e.pointerType, onImage: e.target === vImg };
  } else if (viewer.pointers.size === 2) {
    const [a, b] = [...viewer.pointers.values()], r = vRect();
    clearTimeout(viewer.tapTimer);
    viewer.lastTap = null;
    viewer.g = { mode: 'pinch', d0: dist(a, b) || 1, s0: viewer.s, mx0: (a.x + b.x) / 2 - (r.left + r.width / 2), my0: (a.y + b.y) / 2 - (r.top + r.height / 2), x0: viewer.x, y0: viewer.y, moved: true };
  }
}
function vMove(e) {
  if (!viewer.pointers.has(e.pointerId)) return;
  viewer.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const g = viewer.g;
  if (!g || viewer.busy) return;
  if (g.mode === 'pinch') {
    if (viewer.pointers.size < 2) return;
    const [a, b] = [...viewer.pointers.values()], r = vRect();
    const mx = (a.x + b.x) / 2 - (r.left + r.width / 2), my = (a.y + b.y) / 2 - (r.top + r.height / 2);
    const ns = clamp(g.s0 * dist(a, b) / g.d0, .7, 6);
    viewer.x = mx - ns * (g.mx0 - g.x0) / g.s0;
    viewer.y = my - ns * (g.my0 - g.y0) / g.s0;
    viewer.s = ns;
    vApply(false);
    return;
  }
  const dx = e.clientX - g.sx, dy = e.clientY - g.sy;
  if (!g.moved && Math.hypot(dx, dy) < 8) return;
  g.moved = true;
  if (viewer.s > 1.01) { g.mode = 'pan'; viewer.x = g.x0 + dx; viewer.y = g.y0 + dy; vClamp(); vApply(false); return; }
  if (!g.mode) g.mode = Math.abs(dx) > Math.abs(dy) ? 'swipe' : dy > 0 ? 'dismiss' : 'none';
  if (g.mode === 'swipe') {
    const edge = (dx > 0 && viewer.i === 0) || (dx < 0 && viewer.i === viewer.list.length - 1);
    viewer.x = edge ? dx * .3 : dx; viewer.y = 0;
    vApply(false);
  } else if (g.mode === 'dismiss') {
    const y = Math.max(0, dy), k = 1 - Math.min(1, y / 600) * .3;
    vImg.style.transition = 'none';
    vImg.style.transform = `translate3d(${dx * .5}px,${y}px,0) scale(${k})`;
    vEl.style.setProperty('--dim', String(1 - Math.min(.85, y / 360)));
    vEl.classList.add('chrome-off');
  }
}
function vUp(e) {
  if (!viewer.pointers.has(e.pointerId)) return;
  viewer.pointers.delete(e.pointerId);
  const g = viewer.g;
  if (!g) return;
  if (g.mode === 'pinch') {
    if (viewer.pointers.size === 1) {
      const [p] = [...viewer.pointers.values()];
      viewer.g = { mode: 'pan', sx: p.x, sy: p.y, x0: viewer.x, y0: viewer.y, t: performance.now(), moved: true };
    } else if (!viewer.pointers.size) viewer.g = null;
    if (viewer.s < 1) vResetZoom();
    if (viewer.s > 5) viewer.s = 5;
    vClamp(); vApply(true);
    return;
  }
  if (viewer.pointers.size) return;
  viewer.g = null;
  const dx = e.clientX - g.sx, dy = e.clientY - g.sy, dt = Math.max(1, performance.now() - g.t);
  if (e.type === 'pointercancel') { if (viewer.s <= 1.01) { vResetZoom(); vApply(true); } vEl.style.setProperty('--dim', '1'); return; }
  if (!g.moved) { vTap(e, g); return; }
  if (g.mode === 'swipe') {
    const dir = dx < 0 ? 1 : -1;
    if ((Math.abs(dx) > vRect().width * .18 || Math.abs(dx) / dt > .5) && viewer.list[viewer.i + dir]) { vGo(dir); return; }
    viewer.x = 0; vApply(true);
  } else if (g.mode === 'dismiss') {
    if (dy > 110 || dy / dt > .6) { closeViewer(); return; }
    vResetZoom(); vApply(true);
    vEl.style.setProperty('--dim', '1');
    vEl.classList.remove('chrome-off');
  }
}
function vTap(e, g) {
  const now = performance.now();
  if (viewer.lastTap && now - viewer.lastTap.t < 300 && Math.hypot(e.clientX - viewer.lastTap.x, e.clientY - viewer.lastTap.y) < 40) {
    clearTimeout(viewer.tapTimer);
    viewer.lastTap = null;
    vToggleZoom(e.clientX, e.clientY);
    return;
  }
  viewer.lastTap = { t: now, x: e.clientX, y: e.clientY };
  clearTimeout(viewer.tapTimer);
  viewer.tapTimer = setTimeout(() => {
    viewer.lastTap = null;
    if (g.type === 'mouse' && !g.onImage && viewer.s <= 1.01) closeViewer();
    else vEl.classList.toggle('chrome-off');
  }, 280);
}
function vUpdateChrome() {
  const p = viewer.list[viewer.i], n = viewer.list.length;
  $('#v-name').textContent = p.name;
  $('#v-meta').textContent = `${folderById(p.folderId)?.name || ''} · ${fmtDate(p.created)}${p.demo ? ' · 示範照片' : ''}`;
  $('#v-count').textContent = `${pad2(viewer.i + 1)} / ${pad2(n)}`;
  $('[data-action="lb-prev"]', vEl).disabled = viewer.i === 0;
  $('[data-action="lb-next"]', vEl).disabled = viewer.i === n - 1;
  for (const d of [-1, 1]) { const q = viewer.list[viewer.i + d]; if (q) { const im = new Image(); im.src = photoSrc(q); } }
}
function vLoad() {
  const p = viewer.list[viewer.i];
  vResetZoom();
  vApply(false);
  vImg.src = photoSrc(p);
  vImg.alt = p.name;
  vUpdateChrome();
}
// Map the viewer image's untransformed box onto another element's rectangle.
function vTransformFor(rect) {
  const r = vRect(), w = vImg.clientWidth || 1, h = vImg.clientHeight || 1;
  const k = Math.max(rect.width / w, rect.height / h);
  const tx = rect.left + rect.width / 2 - (r.left + r.width / 2), ty = rect.top + rect.height / 2 - (r.top + r.height / 2);
  return `translate3d(${tx}px,${ty}px,0) scale(${k})`;
}
function sourceImage() {
  if (view !== 'album') return null;
  const el = layout === 'grid' ? $(`.tile[data-index="${viewer.i}"] img`) : $('#album-image');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width && r.bottom > 0 && r.top < innerHeight ? r : null;
}
async function openViewer(i = index) {
  const list = folderPhotos();
  if (!list.length || viewer.open) return;
  if (!vEl) buildViewer();
  viewer.list = list;
  viewer.i = viewer.start = clamp(i, 0, list.length - 1);
  viewer.open = true;
  viewer.returnFocus = document.activeElement;
  vEl.classList.remove('chrome-off');
  vEl.style.setProperty('--dim', '1');
  vEl.hidden = false;
  document.documentElement.classList.add('no-scroll');
  history.pushState({ ...(history.state || {}), viewer: true }, '');
  vLoad();
  $('#v-close').focus({ preventScroll: true });
  const from = sourceImage();
  requestAnimationFrame(() => vEl.classList.add('open'));
  if (!from || reduced()) return;
  try { await vImg.decode(); } catch { /* still animate */ }
  if (!viewer.open) return;
  vImg.animate([{ transform: vTransformFor(from), opacity: .85 }, { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
}
function closeViewer(fromHistory = false) {
  if (!viewer.open) return;
  viewer.open = false;
  clearTimeout(viewer.tapTimer);
  viewer.pointers.clear();
  viewer.g = null;
  if (!fromHistory && history.state?.viewer) history.back();
  document.documentElement.classList.remove('no-scroll');
  const changed = viewer.i !== viewer.start;
  index = viewer.i;
  if (view === 'album' && changed) renderAlbum();
  const to = sourceImage();
  vEl.classList.remove('open');
  const finish = () => {
    if (viewer.open) return;
    vEl.hidden = true;
    vImg.removeAttribute('src');
    const target = view === 'album' ? (layout === 'grid' ? $(`.tile[data-index="${index}"]`) : $('.stage-open')) : null;
    (target || (viewer.returnFocus?.isConnected ? viewer.returnFocus : null))?.focus({ preventScroll: true });
  };
  if (to && !reduced()) {
    vImg.animate([{ transform: vImg.style.transform || 'none', opacity: 1 }, { transform: vTransformFor(to), opacity: .6 }], { duration: 300, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' })
      .finished.catch(() => {}).then(() => { vImg.getAnimations().forEach(a => a.cancel()); finish(); });
  } else setTimeout(finish, reduced() ? 0 : 250);
}
async function vGo(dir) {
  const ni = viewer.i + dir;
  if (!viewer.list[ni]) { viewer.x = 0; vApply(true); return; }
  if (viewer.busy) return;
  viewer.busy = true;
  haptic(5);
  const W = vRect().width;
  try {
    if (!reduced()) {
      const out = vImg.animate([{ transform: vImg.style.transform || 'none', opacity: 1 }, { transform: `translate3d(${-dir * W * .5}px,0,0) scale(${viewer.s})`, opacity: 0 }], { duration: 170, easing: 'ease-in', fill: 'forwards' });
      await out.finished.catch(() => {});
      viewer.i = ni;
      vLoad();
      try { await vImg.decode(); } catch { /* show anyway */ }
      out.cancel();
      vImg.animate([{ transform: `translate3d(${dir * W * .28}px,0,0)`, opacity: 0 }, { transform: 'translate3d(0,0,0)', opacity: 1 }], { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' });
    } else { viewer.i = ni; vLoad(); }
  } finally { viewer.busy = false; }
}
function viewerKey(e) {
  if (e.key === 'Escape') { e.preventDefault(); closeViewer(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); vGo(-1); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); vGo(1); }
  else if (e.key === '+' || e.key === '=') vZoomTo(viewer.s * 1.4);
  else if (e.key === '-') vZoomTo(viewer.s / 1.4);
  else if (e.key === '0') vZoomTo(1);
  else if (e.key === 'Tab') {
    const items = $$('button:not(:disabled)', vEl).filter(b => b.offsetParent !== null);
    if (!items.length) return;
    const at = items.indexOf(document.activeElement);
    e.preventDefault();
    items[(at + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
  }
}

/* --------------------------------------------------------------------------
   Dialogs
   -------------------------------------------------------------------------- */

function showDialog(title, body, actions = '', opts = {}) {
  clearTimeout(dialogCloseTimer);
  const keepToast = toastEl.parentNode === dialog;
  dialog.className = (opts.wide ? 'wide' : opts.confirm ? 'confirm' : '') + (opts.still && dialog.open ? ' still' : '');
  dialog.innerHTML = `<div class="sheet-handle" aria-hidden="true"></div><div class="dialog-head"><h2 id="dialog-title">${title}</h2>${iconBtn('close-dialog', 'close', '關閉')}</div>${body}${actions ? `<div class="dialog-actions">${actions}</div>` : ''}`;
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  if (keepToast) dialog.append(toastEl);
  if (!dialog.open) dialog.showModal();
  if (opts.scroll != null) dialog.scrollTop = opts.scroll === Infinity ? dialog.scrollHeight : opts.scroll;
}
function closeDialog() {
  if (!dialog.open) return;
  if (reduced()) { dialog.close(); return; }
  dialog.classList.add('closing');
  clearTimeout(dialogCloseTimer);
  dialogCloseTimer = setTimeout(() => { dialog.classList.remove('closing'); if (dialog.open) dialog.close(); }, 190);
}
dialog.addEventListener('cancel', e => { e.preventDefault(); closeDialog(); });
dialog.addEventListener('close', () => { cropState = null; afterFolderSave = null; exportJob = null; exportBusy = false; dialog.className = ''; if (toastEl.parentNode === dialog) document.body.append(toastEl); });
dialog.addEventListener('click', e => {
  if (e.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog();
});
dialog.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.isComposing && e.target.matches('input[type=text]')) {
    e.preventDefault();
    $('.dialog-actions .btn-jelly', dialog)?.click();
  }
});

let managerScroll = 0;
const inManager = () => dialog.open && !!$('.fm-list', dialog);
function showFolders(scroll) {
  showDialog('Room for more ideas.', `<p class="dialog-lead">給每種靈感一個位置。相機四周的果汁格會隨資料夾數量調整；只有一個資料夾時，外框不分格。</p>
    <div class="fm-list">${folders.map((f, i) => `<div class="fm-row"><span class="fm-dot flavor-${i % 6}">${icon('folder')}</span><span class="fm-name">${esc(f.name)}<small>${countIn(f.id)} 張照片</small></span>${iconBtn('rename-folder', 'edit', `重新命名「${esc(f.name)}」`, `data-id="${esc(f.id)}"`)}${iconBtn('delete-folder', 'trash', `刪除「${esc(f.name)}」`, `data-id="${esc(f.id)}" ${folders.length === 1 ? 'disabled' : ''}`, 'danger')}</div>`).join('')}</div>
    ${folders.length < MAX_FOLDERS ? `<button class="btn-jelly block j" data-action="new-folder">${icon('plus')}新增資料夾</button>` : `<p class="dialog-note">最多 ${MAX_FOLDERS} 個資料夾，讓相機四周保持好點選。</p>`}`, '', { still: scroll != null, scroll });
}
function backToFolders() { showFolders(managerScroll); }
function editFolder(id, { then = null, back = 'folders-back' } = {}) {
  if (!id && folders.length >= MAX_FOLDERS) { warn(`最多可建立 ${MAX_FOLDERS} 個資料夾`); return; }
  if (inManager()) managerScroll = dialog.scrollTop;
  const f = folderById(id);
  const ideas = ['午後的光', '材質', '配色', '字體', '街角', '植物', '構圖', '包裝'].filter(s => !folders.some(x => x.name === s)).slice(0, 5);
  showDialog(f ? 'Rename a little space.' : 'A new little space.',
    `<label for="folder-name">資料夾名稱</label><input id="folder-name" type="text" maxlength="24" value="${esc(f?.name || '')}" placeholder="例如：午後的光" autocomplete="off" enterkeyhint="done"><p id="folder-error" class="field-error" role="alert"></p>
    ${!f && ideas.length ? `<div class="suggest" aria-label="名稱建議">${ideas.map(s => `<button class="suggest-chip" data-action="suggest-name" data-name="${esc(s)}">${esc(s)}</button>`).join('')}</div>` : ''}`,
    `<button class="btn-ghost j" data-action="${back}">取消</button><button class="btn-jelly j" data-action="save-folder" data-id="${esc(id || '')}">${icon('check')}儲存</button>`);
  afterFolderSave = then;
  const input = $('#folder-name');
  input.focus();
  input.select();
}
async function storeFolder(id) {
  const input = $('#folder-name'), err = $('#folder-error');
  const name = input.value.trim().replace(/\s+/g, ' ');
  if (!name) { err.textContent = '請輸入資料夾名稱'; shake(input); input.focus(); return; }
  if (folders.some(f => f.name === name && f.id !== id)) { err.textContent = '這個名稱已經存在'; shake(input); input.focus(); return; }
  if (!id && folders.length >= MAX_FOLDERS) { err.textContent = `最多可建立 ${MAX_FOLDERS} 個資料夾`; return; }
  const old = structuredClone(folders), newId = id || uid();
  if (id) folderById(id).name = name; else folders.push({ id: newId, name });
  try { await saveFolders(); } catch { folders = old; warn('無法儲存資料夾，請重試'); return; }
  const then = afterFolderSave;
  afterFolderSave = null;
  toast(id ? '資料夾已重新命名' : `已新增「${name}」`);
  if (then) { closeDialog(); render(); await then(newId); }
  else { render(); showFolders(id ? managerScroll : Infinity); }
}
function deleteTarget(id) {
  const i = folderIndex(id);
  return folders[i - 1] || folders[i + 1];
}
function askDeleteFolder(id) {
  const f = folderById(id), target = deleteTarget(id), n = countIn(id);
  if (!f || !target) return;
  if (inManager()) managerScroll = dialog.scrollTop;
  showDialog(`刪除「${esc(f.name)}」？`, `<p class="dialog-lead">${n
    ? `其中 ${n} 張照片與筆記會移到「${esc(target.name)}」，不會遺失。`
    : '這個資料夾目前沒有照片。'}</p>`,
    `<button class="btn-ghost j" data-action="folders-back">取消</button><button class="btn-jelly danger-gel j" data-action="confirm-delete-folder" data-id="${esc(id)}">${icon('trash')}刪除</button>`, { confirm: true });
}
async function deleteFolder(id) {
  const f = folderById(id), target = deleteTarget(id);
  if (!f || !target) return;
  const oldFolders = folders.map(x => ({ ...x })), nextFolders = folders.filter(x => x.id !== id);
  const moved = photos.filter(p => p.folderId === id).map(p => p.id), movedSet = new Set(moved);
  try {
    await transaction(['settings', 'photos'], tx => {
      tx.objectStore('settings').put(nextFolders, 'folders');
      moveRecords(tx, rec => rec.folderId === id, target.id);
    });
  } catch (e) { console.error(e); warn('刪除失敗，請再試一次'); return; }
  for (const p of photos) if (p.folderId === id) p.folderId = target.id;
  folders = nextFolders;
  if (folderId === id) { folderId = target.id; index = 0; rememberFolder(); }
  render();
  if (dialog.open) backToFolders();
  haptic(14);
  toast(`已刪除「${f.name}」${moved.length ? `，照片移到「${target.name}」` : ''}`, {
    icon: 'trash', label: '復原', duration: 6000, action: async () => {
      try {
        await transaction(['settings', 'photos'], tx => {
          tx.objectStore('settings').put(oldFolders, 'folders');
          moveRecords(tx, rec => movedSet.has(rec.id), id);
        });
        folders = oldFolders;
        for (const p of photos) if (movedSet.has(p.id)) p.folderId = id;
        render();
        if (inManager()) showFolders(dialog.scrollTop);
        toast(`已復原「${f.name}」`);
      } catch { warn('復原失敗，請再試一次'); }
    }
  });
}
function askMove() {
  const p = current();
  if (!p) return;
  showDialog('A different little space.', `<p class="dialog-lead">將「${esc(p.name)}」移動到：</p><div class="move-list">${folders.map((f, i) => `<button class="move-opt j" data-action="confirm-move" data-id="${esc(f.id)}" ${f.id === p.folderId ? 'disabled aria-current="true"' : ''}><i class="chip-dot flavor-${i % 6}"></i><span>${esc(f.name)}</span><small>${f.id === p.folderId ? '目前' : countIn(f.id)}</small></button>`).join('')}</div>`);
}
async function movePhoto(target) {
  const p = current();
  if (!p || target === p.folderId) return;
  try { await patchPhoto(p.id, rec => { rec.folderId = target; }); }
  catch (e) { console.error(e); warn('移動失敗，請再試一次'); return; }
  p.folderId = target;
  closeDialog();
  renderAlbum();
  toast(`已移動到「${folderById(target).name}」`, { label: '前往', action: () => openPhoto(p.id) });
}
const pendingDeletes = new Map();
function commitDelete(id) {
  clearTimeout(pendingDeletes.get(id));
  pendingDeletes.delete(id);
  return request('photos', 'readwrite', st => st.delete(id)).catch(() => {});
}
function flushDeletes() { for (const id of [...pendingDeletes.keys()]) commitDelete(id); }
async function deletePhoto() {
  const p = current();
  if (!p) return;
  clearTimeout(noteTimers.get(p.id));
  noteTimers.delete(p.id);
  photos = photos.filter(x => x.id !== p.id);
  pendingDeletes.set(p.id, setTimeout(() => commitDelete(p.id), 6500));
  haptic(14);
  renderAlbum();
  toast('照片已刪除', {
    icon: 'trash', label: '復原', duration: 6000, action: () => {
      if (!pendingDeletes.has(p.id)) { warn('已無法復原'); return; }
      clearTimeout(pendingDeletes.get(p.id));
      pendingDeletes.delete(p.id);
      photos.push(p);
      if (p.note) patchPhoto(p.id, rec => { rec.note = p.note; }).catch(() => {});
      if (view === 'album') { folderId = p.folderId; index = Math.max(0, folderPhotos().findIndex(x => x.id === p.id)); renderAlbum(); }
      else render();
      toast('已復原照片');
    }
  });
}
function askRename() {
  const p = current();
  if (!p) return;
  showDialog('Name this moment.', `<label for="photo-name">照片名稱</label><input id="photo-name" type="text" maxlength="60" value="${esc(p.name)}" autocomplete="off" enterkeyhint="done"><p id="photo-name-error" class="field-error" role="alert"></p>`,
    `<button class="btn-ghost j" data-action="close-dialog">取消</button><button class="btn-jelly j" data-action="save-photo-name">${icon('check')}儲存</button>`);
  const input = $('#photo-name');
  input.focus();
  input.select();
}
async function savePhotoName() {
  const input = $('#photo-name'), name = input.value.trim().replace(/\s+/g, ' ');
  if (!name) { $('#photo-name-error').textContent = '請輸入名稱'; shake(input); return; }
  const p = current();
  try { await patchPhoto(p.id, rec => { rec.name = name; }); }
  catch (e) { console.error(e); warn('儲存失敗，請再試一次'); return; }
  p.name = name;
  closeDialog();
  renderAlbum();
  toast('名稱已更新');
}
function askClearSamples() {
  const n = photos.filter(p => p.demo).length;
  showDialog('清除示範照片？', `<p class="dialog-lead">移除 ${n} 張示範照片與它們的筆記。你自己拍攝或匯入的照片不受影響，示範照片之後也不會再出現。</p>`,
    `<button class="btn-ghost j" data-action="close-dialog">保留</button><button class="btn-jelly j" data-action="confirm-clear-samples">${icon('sparkle')}清除</button>`, { confirm: true });
}
async function clearSamples() {
  const demos = photos.filter(p => p.demo);
  try {
    await transaction(['photos'], tx => { for (const p of demos) tx.objectStore('photos').delete(p.id); });
    photos = photos.filter(p => !p.demo);
    demos.forEach(invalidate);
    index = 0;
    closeDialog();
    render();
    toast(`已清除 ${demos.length} 張示範照片`);
  } catch (e) { console.error(e); warn('清除失敗，請再試一次'); }
}

/* --------------------------------------------------------------------------
   Import, edit, export
   -------------------------------------------------------------------------- */

function loadImage(src) {
  return new Promise((resolve, reject) => { const im = new Image(); im.onload = () => resolve(im); im.onerror = reject; im.src = src; });
}
function canvasBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('encoding')), 'image/jpeg', .93));
}
async function normalizeFile(file) {
  if (!ACCEPTED.includes(file.type)) throw new Error('type');
  if (file.size > 25 * 1024 * 1024) throw new Error('size');
  const url = URL.createObjectURL(file);
  try {
    const im = await loadImage(url);
    if (im.naturalWidth * im.naturalHeight > 64000000) throw new Error('dimensions');
    const scale = Math.min(1, 2400 / Math.max(im.naturalWidth, im.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(im.naturalWidth * scale);
    c.height = Math.round(im.naturalHeight * scale);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(im, 0, 0, c.width, c.height);
    return await canvasBlob(c);
  } finally { URL.revokeObjectURL(url); }
}
async function importFiles(files, native = false) {
  if (!files.length || busy) return;
  busy = true;
  let ok = 0, failed = 0;
  const target = folderId, targetName = folderById(target)?.name || '';
  try {
    for (const file of files) {
      if (files.length > 1) toast(`匯入中 ${ok + failed + 1} / ${files.length}…`, { icon: 'import', duration: 60000 });
      try {
        const blob = await normalizeFile(file);
        if (native && view === 'camera' && files.length === 1) {
          clearPending();
          pending = { blob, url: URL.createObjectURL(blob) };
          busy = false;
          renderCamera();
          return;
        }
        const p = { id: uid(), blob, folderId: target, note: '', name: file.name.replace(/\.[^.]+$/, '').slice(0, 60) || '匯入的靈感', created: Date.now() + ok, demo: false };
        await savePhoto(p);
        photos.push(p);
        ok++;
      } catch { failed++; }
    }
    index = 0;
    navDir = 0;
    if (ok) persistStorage();
    const msg = ok ? `${ok} 張照片已存到「${targetName}」` : '沒有匯入任何照片';
    const hint = failed ? `；${failed} 張無法匯入（請使用 JPEG/PNG/WebP 等格式，單張不超過 25 MB／6400 萬像素）` : '';
    if (view === 'album') { render(); toast(msg + hint, { icon: ok ? 'check' : 'close', duration: failed ? 6000 : 3000 }); }
    else { render(); toast(msg + hint, ok ? { label: '查看', action: () => { folderId = target; index = 0; go('album'); } } : { icon: 'close' }); }
  } finally {
    busy = false;
    $('#file-input').value = '';
    $('#native-input').value = '';
  }
}
async function updatePhotoBlob(p, blob) {
  const sample = p.blob || p.originalBlob ? null : await (await fetch(p.src)).blob();
  const updated = await patchPhoto(p.id, rec => { rec.originalBlob = rec.originalBlob || rec.blob || sample; rec.blob = blob; });
  Object.assign(p, updated);
  invalidate(p);
}
async function rotatePhoto() {
  const p = current();
  if (!p || busy) return;
  busy = true;
  const img = $('#album-image');
  const spin = img && !reduced() ? img.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(90deg) scale(.8)', opacity: .6 }], { duration: 260, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' }) : null;
  try {
    const im = await loadImage(photoSrc(p));
    const c = document.createElement('canvas');
    c.width = im.naturalHeight; c.height = im.naturalWidth;
    const ctx = c.getContext('2d');
    ctx.translate(c.width / 2, c.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(im, -im.naturalWidth / 2, -im.naturalHeight / 2);
    await updatePhotoBlob(p, await canvasBlob(c));
    renderAlbum();
    toast('照片已旋轉 90°，可隨時還原');
  } catch { spin?.cancel(); warn('無法調整照片，請重試'); }
  finally { busy = false; }
}
async function openCrop() {
  const p = current();
  if (!p) return;
  let im;
  try { im = await loadImage(photoSrc(p)); } catch { warn('照片無法載入，請重試'); return; }
  const natural = im.naturalWidth / im.naturalHeight;
  cropState = { p, im, ratio: 1, scale: 1, x: 0, y: 0 };
  const ratios = [['原比例', natural], ['1:1', 1], ['4:5', .8], ['3:4', .75], ['9:16', 9 / 16], ['4:3', 4 / 3], ['16:9', 16 / 9]];
  showDialog('Find your frame.', `<p class="dialog-lead">拖曳照片調整位置，雙指、滾輪或拉條縮放，再儲存裁切。</p>
    <div class="crop-preview" tabindex="0" aria-label="裁切預覽，可拖曳或使用方向鍵調整位置"><img src="${photoSrc(p)}" alt="裁切預覽" draggable="false"><div class="crop-window"></div></div>
    <div class="ratio-row" role="group" aria-label="裁切比例">${ratios.map(([label, r]) => `<button class="ratio-btn ${label === '1:1' ? 'active' : ''}" data-action="crop-ratio" data-ratio="${r}" aria-pressed="${label === '1:1'}">${label}</button>`).join('')}</div>
    <div class="zoom-row">${icon('minus')}<input id="crop-zoom" type="range" min="1" max="4" step="0.01" value="1" aria-label="裁切縮放" style="--p:0%">${icon('plus')}</div>`,
    `<button class="btn-ghost j" data-action="close-dialog">取消</button><button class="btn-jelly j" data-action="apply-crop">${icon('check')}儲存裁切</button>`, { wide: true });
  updateCrop();
  const area = $('.crop-preview'), pts = new Map();
  let g = null;
  area.addEventListener('pointerdown', e => {
    area.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) { const [a, b] = [...pts.values()]; g = { pinch: true, d: dist(a, b) || 1, s: cropState.scale }; }
    else g = { x: e.clientX, y: e.clientY, ox: cropState.x, oy: cropState.y };
  });
  area.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId) || !cropState) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (g?.pinch && pts.size >= 2) { const [a, b] = [...pts.values()]; setCropScale(g.s * dist(a, b) / g.d); }
    else if (g && !g.pinch) { cropState.x = g.ox + e.clientX - g.x; cropState.y = g.oy + e.clientY - g.y; updateCrop(); }
  });
  const up = e => {
    pts.delete(e.pointerId);
    if (pts.size === 1 && cropState) { const [q] = [...pts.values()]; g = { x: q.x, y: q.y, ox: cropState.x, oy: cropState.y }; }
    else if (!pts.size) g = null;
  };
  area.addEventListener('pointerup', up);
  area.addEventListener('pointercancel', up);
  area.addEventListener('wheel', e => { e.preventDefault(); if (cropState) setCropScale(cropState.scale * Math.exp(-e.deltaY * .002)); }, { passive: false });
  area.addEventListener('keydown', e => {
    const step = e.shiftKey ? 20 : 5, moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key] && cropState) { e.preventDefault(); cropState.x += moves[e.key][0]; cropState.y += moves[e.key][1]; updateCrop(); }
  });
}
function setCropScale(v) {
  if (!cropState) return;
  cropState.scale = clamp(v, 1, 4);
  const z = $('#crop-zoom');
  if (z) { z.value = cropState.scale; z.style.setProperty('--p', ((cropState.scale - 1) / 3 * 100) + '%'); }
  updateCrop();
}
function updateCrop() {
  const area = $('.crop-preview');
  if (!cropState || !area) return;
  const s = cropState, maxW = Math.max(40, area.clientWidth - 40), maxH = Math.max(40, area.clientHeight - 40);
  const w = Math.min(maxW, maxH * s.ratio), h = w / s.ratio;
  s.w = w; s.h = h;
  s.factor = Math.max(w / s.im.naturalWidth, h / s.im.naturalHeight) * s.scale;
  const iw = s.im.naturalWidth * s.factor, ih = s.im.naturalHeight * s.factor;
  s.x = clamp(s.x, -(iw - w) / 2, (iw - w) / 2);
  s.y = clamp(s.y, -(ih - h) / 2, (ih - h) / 2);
  $('img', area).style.cssText = `position:absolute;width:${iw}px;height:${ih}px;max-width:none;max-height:none;transform:translate(${s.x}px,${s.y}px)`;
  $('.crop-window', area).style.cssText = `width:${w}px;height:${h}px;left:50%;top:50%;transform:translate(-50%,-50%)`;
}
async function applyCrop() {
  if (!cropState || busy) return;
  busy = true;
  const s = cropState;
  try {
    const c = document.createElement('canvas');
    c.width = Math.round(s.w / s.factor);
    c.height = Math.round(s.h / s.factor);
    const sx = (s.im.naturalWidth - c.width) / 2 - s.x / s.factor, sy = (s.im.naturalHeight - c.height) / 2 - s.y / s.factor;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(s.im, sx, sy, c.width, c.height, 0, 0, c.width, c.height);
    await updatePhotoBlob(s.p, await canvasBlob(c));
    closeDialog();
    renderAlbum();
    toast('裁切已儲存，可隨時還原');
  } catch { warn('裁切儲存失敗，請重試'); }
  finally { busy = false; }
}
async function resetPhoto() {
  const p = current();
  if (!p?.originalBlob) return;
  try {
    const updated = await patchPhoto(p.id, rec => { if (rec.originalBlob) rec.blob = rec.originalBlob; delete rec.originalBlob; });
    delete p.originalBlob;
    Object.assign(p, updated);
    invalidate(p);
    renderAlbum();
    toast('已還原原始照片');
  } catch { warn('還原失敗，請重試'); }
}
async function downloadPhoto(p = current()) {
  if (!p) return;
  try {
    const blob = await photoBlob(p);
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url;
    a.download = safeName(p.name) + '.jpg';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    toast('已開始下載', { icon: 'download' });
  } catch { warn('下載失敗，請再試一次'); }
}
async function sharePhoto(p = current()) {
  if (!p) return;
  try {
    const blob = await photoBlob(p);
    const file = new File([blob], safeName(p.name) + '.jpg', { type: 'image/jpeg' });
    if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: p.name });
    else await downloadPhoto(p);
  } catch (e) {
    if (e?.name !== 'AbortError') { warn('無法分享，已改為下載'); downloadPhoto(p); }
  }
}

/* --------------------------------------------------------------------------
   Save to album + export
   -------------------------------------------------------------------------- */

const isoDay = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`; };
function makeFile(p, blob, name = safeName(p.name) + '.jpg') {
  const file = new File([blob], name, { type: 'image/jpeg', lastModified: p.created });
  fileCache.set(p.id, file);
  return file;
}
async function fileFor(p) { return fileCache.get(p.id) || makeFile(p, await photoBlob(p)); }

// Save one photo: share sheet on phones ("儲存影像" puts it in the photo album), download elsewhere.
async function savePhotoToAlbum(p = current()) {
  if (!p) return;
  if (!toAlbum()) { await downloadPhoto(p); return; }
  let file = fileCache.get(p.id) || (p.blob ? makeFile(p, p.blob) : null);
  const prepared = !!file;
  if (!file) {
    try { file = await fileFor(p); } catch { warn('照片無法讀取，請再試一次'); return; }
  }
  try {
    await navigator.share({ files: [file] });
    toast('已完成');
  } catch (e) {
    if (e?.name === 'AbortError') return;
    if (e?.name === 'NotAllowedError' && !prepared) { toast('照片已準備好，請再點一次「儲存」', { icon: 'saveImg' }); return; }
    warn('無法開啟儲存選單，已改為下載');
    await downloadPhoto(p);
  }
}

let exportSel = new Set(), exportJob = null, exportBusy = false;
const exportList = () => folders.filter(f => exportSel.has(f.id)).flatMap(f => photos.filter(p => p.folderId === f.id).sort(byNewest));
function openExport() {
  exportSel = new Set(folders.filter(f => countIn(f.id)).map(f => f.id));
  if (view === 'album' && countIn(folderId) && exportSel.size > 1) exportSel = new Set([folderId]);
  exportJob = null;
  const album = toAlbum();
  showDialog('匯出照片', `<p class="dialog-lead">選擇要匯出的資料夾。${album ? '照片會透過分享選單存到手機相簿。' : '照片會依資料夾打包成一個 ZIP 檔下載。'}</p>
    <div class="pick-head"><span id="export-summary" class="pick-summary"></span><button class="link-btn" data-action="export-all" id="export-all"></button></div>
    <div class="pick-list">${folders.map((f, i) => { const n = countIn(f.id), on = exportSel.has(f.id); return `<button class="pick-row j ${on ? 'on' : ''}" role="checkbox" aria-checked="${on}" data-action="export-toggle" data-id="${esc(f.id)}" ${n ? '' : 'disabled'}><span class="fm-dot flavor-${i % 6}">${icon('folder')}</span><span class="pick-name">${esc(f.name)}<small>${n ? n + ' 張照片' : '沒有照片'}</small></span><span class="pick-box">${icon('check')}</span></button>`; }).join('')}</div>
    <div class="export-progress" id="export-progress" hidden><span class="export-bar"><i id="export-bar"></i></span><p id="export-status"></p></div>
    ${album ? '<p class="dialog-note export-hint" id="export-hint"></p>' : ''}`,
    `${album ? `<button class="btn-ghost j" data-action="export-zip" title="下載 ZIP 檔">${icon('download')}ZIP</button>` : '<button class="btn-ghost j" data-action="close-dialog">取消</button>'}<button class="btn-jelly j" id="export-go" data-action="${album ? 'export-share' : 'export-zip'}">${icon(album ? 'saveImg' : 'download')}<span id="export-go-label"></span></button>`);
  updateExport();
}
function updateExport() {
  const list = exportList(), all = folders.filter(f => countIn(f.id));
  const summary = $('#export-summary'), allBtn = $('#export-all'), go = $('#export-go'), label = $('#export-go-label'), hint = $('#export-hint');
  if (!summary) return;
  summary.textContent = list.length ? `已選 ${exportSel.size} 個資料夾 · ${list.length} 張照片` : '請選擇至少一個資料夾';
  const allOn = all.length > 0 && all.every(f => exportSel.has(f.id));
  allBtn.textContent = allOn ? '取消全選' : '全選';
  allBtn.hidden = !all.length;
  go.disabled = !list.length || exportBusy;
  $$('[data-action="export-zip"], .pick-row, #export-all', dialog).forEach(b => { if (b.classList.contains('pick-row') && !countIn(b.dataset.id)) return; b.disabled = exportBusy || (b.dataset.action === 'export-zip' && !list.length); });
  if (!toAlbum()) { label.textContent = list.length ? `下載 ZIP（${list.length} 張）` : '下載 ZIP'; return; }
  const job = exportJob;
  if (job?.ready) {
    const batch = job.batches[job.next];
    label.textContent = job.batches.length > 1 ? `儲存第 ${job.next + 1}/${job.batches.length} 批（${batch.length} 張）` : `存到相簿（${batch.length} 張）`;
  } else label.textContent = list.length ? `存到相簿（${list.length} 張）` : '存到相簿';
  if (hint) hint.textContent = list.length ? `在分享選單點「儲存 ${job?.ready ? job.batches[job.next].length : Math.min(list.length, BATCH_MAX)} 張影像」，照片就會出現在手機相簿。${list.length > BATCH_MAX ? `照片較多時會分批儲存，每批最多 ${BATCH_MAX} 張。` : ''}` : '';
}
function exportProgress(done, total, text) {
  const box = $('#export-progress');
  if (!box) return;
  box.hidden = false;
  $('#export-bar').style.width = (total ? done / total * 100 : 0) + '%';
  $('#export-status').textContent = text;
}
function setExportBusy(v) { exportBusy = v; updateExport(); }
function toggleExport(id) {
  if (exportBusy) return;
  exportSel.has(id) ? exportSel.delete(id) : exportSel.add(id);
  exportJob = null;
  const row = $(`.pick-row[data-id="${CSS.escape(id)}"]`, dialog), on = exportSel.has(id);
  row?.classList.toggle('on', on);
  row?.setAttribute('aria-checked', on);
  $('#export-progress').hidden = true;
  haptic(6);
  updateExport();
}
function toggleExportAll() {
  if (exportBusy) return;
  const all = folders.filter(f => countIn(f.id)), allOn = all.every(f => exportSel.has(f.id));
  exportSel = new Set(allOn ? [] : all.map(f => f.id));
  exportJob = null;
  $$('.pick-row', dialog).forEach(r => { const on = exportSel.has(r.dataset.id); r.classList.toggle('on', on); r.setAttribute('aria-checked', on); });
  $('#export-progress').hidden = true;
  updateExport();
}
const BATCH_MAX = 20, BATCH_BYTES = 60 * 1024 * 1024;
async function exportShare() {
  if (exportBusy) return;
  if (exportJob?.ready) { await shareNextBatch(); return; }
  const list = exportList();
  if (!list.length) return;
  // Files already in memory can be shared within this same tap; otherwise a second tap opens the sheet.
  const instant = list.every(p => p.blob || fileCache.has(p.id));
  setExportBusy(true);
  const files = [];
  try {
    for (let i = 0; i < list.length; i++) {
      if (!instant) exportProgress(i, list.length, `準備中 ${i + 1} / ${list.length}`);
      files.push(await fileFor(list[i]));
    }
  } catch { setExportBusy(false); warn('有照片無法讀取，請再試一次'); return; }
  const batches = [];
  let cur = [], bytes = 0;
  for (const f of files) {
    if (cur.length && (cur.length >= BATCH_MAX || bytes + f.size > BATCH_BYTES)) { batches.push(cur); cur = []; bytes = 0; }
    cur.push(f); bytes += f.size;
  }
  if (cur.length) batches.push(cur);
  exportJob = { ready: true, total: files.length, batches, next: 0 };
  exportBusy = false;
  if (instant) { await shareNextBatch(); return; }
  exportProgress(0, batches.length, batches.length > 1 ? `已準備好 ${files.length} 張，分 ${batches.length} 批儲存` : `已準備好 ${files.length} 張，點下方按鈕開啟儲存選單`);
  updateExport();
}
async function shareNextBatch() {
  const job = exportJob, batch = job.batches[job.next];
  try {
    await navigator.share({ files: batch });
  } catch (e) {
    updateExport();
    if (e?.name === 'AbortError') return;
    if (e?.name === 'NotAllowedError') { exportProgress(job.next, job.batches.length, '已準備好，點下方按鈕開啟儲存選單'); return; }
    warn('無法開啟儲存選單，可以改用 ZIP 下載');
    return;
  }
  job.next++;
  haptic(10);
  if (job.next >= job.batches.length) {
    exportJob = null;
    closeDialog();
    toast(`已匯出 ${job.total} 張照片`);
    return;
  }
  exportProgress(job.next, job.batches.length, `已完成 ${job.next} / ${job.batches.length} 批，繼續儲存下一批`);
  updateExport();
}

// Minimal ZIP writer (stored, no compression: JPEGs are already compressed).
const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(bytes) { let c = 0xffffffff; for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function dosStamp(t) {
  const d = new Date(t), y = Math.max(1980, d.getFullYear());
  return { time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date: ((y - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate() };
}
function buildZip(entries) {
  const enc = new TextEncoder(), parts = [], central = [];
  let offset = 0;
  for (const e of entries) {
    const name = enc.encode(e.name), size = e.data.length, { time, date } = dosStamp(e.time);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
    h.setUint16(10, time, true); h.setUint16(12, date, true); h.setUint32(14, e.crc, true);
    h.setUint32(18, size, true); h.setUint32(22, size, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
    parts.push(h.buffer, name, e.data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
    c.setUint16(12, time, true); c.setUint16(14, date, true); c.setUint32(16, e.crc, true);
    c.setUint32(20, size, true); c.setUint32(24, size, true); c.setUint16(28, name.length, true);
    c.setUint32(42, offset, true);
    central.push(c.buffer, name);
    offset += 30 + name.length + size;
  }
  const cdSize = central.reduce((n, b) => n + b.byteLength, 0), end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
  return new Blob([...parts, ...central, end.buffer], { type: 'application/zip' });
}
async function exportZip() {
  if (exportBusy) return;
  const list = exportList();
  if (!list.length) return;
  setExportBusy(true);
  try {
    const entries = [], counters = new Map();
    for (let i = 0; i < list.length; i++) {
      const p = list[i], folder = safeName(folderById(p.folderId)?.name || 'Insp');
      exportProgress(i, list.length, `打包中 ${i + 1} / ${list.length}`);
      const n = (counters.get(folder) || 0) + 1;
      counters.set(folder, n);
      const data = new Uint8Array(await (await photoBlob(p)).arrayBuffer());
      entries.push({ name: `${folder}/${String(n).padStart(3, '0')}_${safeName(p.name)}.jpg`, data, crc: crc32(data), time: p.created });
    }
    const url = URL.createObjectURL(buildZip(entries)), a = document.createElement('a');
    a.href = url;
    a.download = `Insp-Camera-${isoDay()}.zip`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    exportBusy = false;
    closeDialog();
    toast(`已下載 ${list.length} 張照片的 ZIP 檔`, { icon: 'download' });
  } catch (e) {
    console.error(e);
    setExportBusy(false);
    warn('打包失敗，請減少資料夾後再試一次');
  }
}

/* --------------------------------------------------------------------------
   Actions
   -------------------------------------------------------------------------- */

async function handle(action, el) {
  switch (action) {
    case 'home': go('home'); break;
    case 'camera': go('camera'); break;
    case 'album': go('album'); break;
    case 'open-photo': openPhoto(el.dataset.id); break;
    case 'camera-last': { const last = latestPhoto(); if (last) openPhoto(last.id); else go('album'); break; }
    case 'install': if (installPrompt) { installPrompt.prompt(); await installPrompt.userChoice.catch(() => {}); installPrompt = null; render(); } break;

    case 'start-camera': cameraError = ''; cameraStarting = true; renderCamera(); await startCamera(); break;
    case 'native-camera': $('#native-input').click(); break;
    case 'flip-camera': await flipCamera(); break;
    case 'shutter': await capture(); break;
    case 'retake': clearPending(); haptic(6); if (!stream && !cameraError) cameraStarting = true; renderCamera(); if (!stream) startCamera(); break;
    case 'choose-folder': if (pending) await storePending(el.dataset.id); else selectFolder(el.dataset.id); break;
    case 'pending-new-folder': editFolder(null, { back: 'close-dialog', then: id => storePending(id) }); break;

    case 'import': $('#file-input').click(); break;
    case 'album-folder': if (folderId !== el.dataset.id) { folderId = el.dataset.id; rememberFolder(); index = 0; navDir = 0; renderAlbum(); } break;
    case 'layout': layout = el.dataset.layout; setSetting('layout', layout).catch(() => {}); navDir = 0; renderAlbum(); break;
    case 'prev': changeIndex(index - 1); break;
    case 'next': changeIndex(index + 1); break;
    case 'thumbnail': changeIndex(Number(el.dataset.index)); break;
    case 'open-viewer': await openViewer(index); break;
    case 'view': await openViewer(Number(el.dataset.index)); break;
    case 'rotate': await rotatePhoto(); break;
    case 'crop': await openCrop(); break;
    case 'reset-photo': await resetPhoto(); break;
    case 'crop-ratio':
      if (!cropState) break;
      cropState.ratio = Number(el.dataset.ratio); cropState.x = 0; cropState.y = 0;
      $$('.ratio-btn').forEach(b => { b.classList.toggle('active', b === el); b.setAttribute('aria-pressed', b === el); });
      updateCrop();
      break;
    case 'apply-crop': await applyCrop(); break;
    case 'download': await downloadPhoto(); break;
    case 'share': await sharePhoto(); break;
    case 'save-photo': await savePhotoToAlbum(); break;
    case 'export': openExport(); break;
    case 'export-toggle': toggleExport(el.dataset.id); break;
    case 'export-all': toggleExportAll(); break;
    case 'export-share': await exportShare(); break;
    case 'export-zip': await exportZip(); break;
    case 'move': askMove(); break;
    case 'confirm-move': await movePhoto(el.dataset.id); break;
    case 'delete': await deletePhoto(); break;
    case 'rename-photo': askRename(); break;
    case 'save-photo-name': await savePhotoName(); break;
    case 'clear-samples': askClearSamples(); break;
    case 'confirm-clear-samples': await clearSamples(); break;

    case 'folders': showFolders(); break;
    case 'folders-back': backToFolders(); break;
    case 'new-folder':
      if (el.closest('dialog')) editFolder(null);
      else editFolder(null, { back: 'close-dialog', then: view === 'album' ? id => { folderId = id; index = 0; renderAlbum(); } : null });
      break;
    case 'suggest-name': { const input = $('#folder-name'); input.value = el.dataset.name; input.focus(); $('#folder-error').textContent = ''; break; }
    case 'rename-folder': editFolder(el.dataset.id); break;
    case 'save-folder': await storeFolder(el.dataset.id || null); break;
    case 'delete-folder': askDeleteFolder(el.dataset.id); break;
    case 'confirm-delete-folder': await deleteFolder(el.dataset.id); break;
    case 'close-dialog': closeDialog(); break;

    case 'lb-close': closeViewer(); break;
    case 'lb-prev': await vGo(-1); break;
    case 'lb-next': await vGo(1); break;
    case 'lb-zoom': vToggleZoom(); break;
    case 'lb-save': await savePhotoToAlbum(viewer.list[viewer.i]); break;
    case 'lb-share': await sharePhoto(viewer.list[viewer.i]); break;
    case 'lb-edit':
      closeViewer();
      if (layout !== 'stage') { layout = 'stage'; setSetting('layout', layout).catch(() => {}); renderAlbum(); }
      requestAnimationFrame(() => $('.details')?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }));
      break;
    case 'toast-action': { const a = toastAction; hideToast(); await a?.(); break; }
  }
}

function jellyKey(b) {
  let key = `[data-action="${CSS.escape(b.dataset.action)}"]`;
  if (b.dataset.id) key += `[data-id="${CSS.escape(b.dataset.id)}"]`;
  if (b.dataset.index) key += `[data-index="${CSS.escape(b.dataset.index)}"]`;
  return key;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-action]');
  if (!b || b.disabled) return;
  if (performance.now() < suppressClickUntil && b.closest('#stage')) return;
  jelly(b);
  const key = jellyKey(b);
  handle(b.dataset.action, b)
    .then(() => {
      if (b.isConnected) return;
      const twin = document.querySelector(key);
      if (twin && !twin.classList.contains('gulp')) jelly(twin);
    })
    .catch(e => { console.error(e); warn('操作未完成，請再試一次'); });
});
document.addEventListener('input', e => {
  if (e.target.id === 'photo-range') {
    const n = Number(e.target.value), list = folderPhotos(), p = list[n];
    e.target.style.setProperty('--p', (list.length > 1 ? n / (list.length - 1) * 100 : 0) + '%');
    if (p) { $('#album-image').src = photoSrc(p); $('.photo-counter').textContent = pad2(n + 1); }
  }
  if (e.target.id === 'crop-zoom') setCropScale(Number(e.target.value));
});
document.addEventListener('change', e => { if (e.target.id === 'photo-range') changeIndex(Number(e.target.value)); });
$('#file-input').addEventListener('change', e => importFiles([...e.target.files]).catch(() => warn('匯入失敗，請重試')));
$('#native-input').addEventListener('change', e => importFiles([...e.target.files], true).catch(() => warn('拍攝匯入失敗，請重試')));

document.addEventListener('keydown', e => {
  if (viewer.open) { viewerKey(e); return; }
  if (dialog.open || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.matches('input, textarea, select, [contenteditable]')) return;
  const onButton = !!e.target.closest('button, a');
  if (view === 'album') {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (layout === 'grid') return;
      e.preventDefault();
      changeIndex(index + (e.key === 'ArrowRight' ? 1 : -1));
    } else if ((e.key === ' ' || e.key === 'f') && !onButton && folderPhotos().length) { e.preventDefault(); openViewer(index); }
  } else if (view === 'camera') {
    if ((e.key === ' ' || e.key === 'Enter') && !onButton) { e.preventDefault(); jelly($('.shutter')); capture(); }
    else if (e.key === 'Escape' && pending) { e.preventDefault(); handle('retake'); }
    else if (/^[1-9]$/.test(e.key)) {
      const f = folders[Number(e.key) - 1];
      if (!f) return;
      jelly($(`.folder-cell[data-id="${CSS.escape(f.id)}"]`));
      if (pending) storePending(f.id); else selectFolder(f.id);
    }
  }
});

/* Drag & drop and paste to import */
let dragDepth = 0;
const hasFiles = e => [...(e.dataTransfer?.types || [])].includes('Files');
const dropZone = document.createElement('div');
dropZone.className = 'drop-zone';
dropZone.setAttribute('aria-hidden', 'true');
document.body.append(dropZone);
addEventListener('dragenter', e => {
  if (!hasFiles(e) || viewer.open) return;
  e.preventDefault();
  if (!dragDepth++) {
    dropZone.innerHTML = `<div><span class="empty-orb">${icon('import')}</span><strong>放開以匯入照片</strong><span>將存到「${esc(folderById(folderId)?.name || '')}」</span></div>`;
    document.body.classList.add('dropping');
  }
});
addEventListener('dragover', e => { if (hasFiles(e)) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; } });
addEventListener('dragleave', e => { if (hasFiles(e) && !(dragDepth = Math.max(0, dragDepth - 1))) document.body.classList.remove('dropping'); });
addEventListener('drop', e => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  dragDepth = 0;
  document.body.classList.remove('dropping');
  const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
  if (files.length && db) importFiles(files).then(() => { if (view === 'home') go('album'); }).catch(() => warn('匯入失敗，請重試'));
});
addEventListener('paste', e => {
  if (!db || dialog.open || viewer.open) return;
  const files = [...(e.clipboardData?.files || [])].filter(f => f.type.startsWith('image/'));
  if (!files.length) return;
  e.preventDefault();
  importFiles(files).catch(() => warn('匯入失敗，請重試'));
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stopCamera(); flushNotes(); flushDeletes(); }
  else if (view === 'camera' && !pending && !stream) { cameraStarting = true; renderCamera(); startCamera(); }
});
addEventListener('pagehide', () => { flushNotes(); flushDeletes(); });
addEventListener('resize', () => { if (cropState) updateCrop(); });
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; if (view === 'home') renderHome(); });
addEventListener('appinstalled', () => { installPrompt = null; toast('已安裝 Insp Camera'); if (view === 'home') renderHome(); });

/* --------------------------------------------------------------------------
   Boot
   -------------------------------------------------------------------------- */

async function init() {
  try {
    db = await openDB();
    folders = await getSetting('folders') || initialFolders;
    await saveFolders();
    photos = await request('photos', 'readonly', s => s.getAll());
    layout = (await getSetting('layout')) === 'grid' ? 'grid' : 'stage';
    if (!await getSetting('seeded')) {
      const samples = [['architecture', '轉角裡的安靜', '暖色的牆面、低飽和的材質，想留住空間裡的呼吸感。', 0], ['light', '光落下的地方', '透過葉隙的光，像是不規則的筆觸。', 1], ['texture', '水面的紋理', '重複的波紋，或許能變成下一張海報的背景。', 2], ['objects', '日常物件的線條', '觀察熟悉物件的比例與輪廓。', 3], ['colors', '一組自然的配色', '從風景裡收集一組讓心安靜的色彩。', 4], ['street', '夜色的層次', '明暗交界處，也藏著值得收藏的細節。', 5], ['light', '自然留下的光譜', '換一個角度，看見另一種光。', 0], ['colors', '日常之外的風景', '這些色彩可以成為空間的靈感。', 0]];
      for (let i = 0; i < samples.length; i++) {
        const [src, name, note, f] = samples[i];
        const p = { id: 'sample-' + i, src: `./assets/${src}.jpg`, folderId: 'f' + f, name, note, created: Date.now() - (i + 1) * 86400000, demo: true };
        if (!folderById(p.folderId)) p.folderId = folders[0].id;
        await savePhoto(p);
        photos.push(p);
      }
      await setSetting('seeded', true);
    }
    const lastFolder = await getSetting('lastFolder');
    folderId = folderById(lastFolder) ? lastFolder : folders[0].id;
    view = routeFromHash();
    history.replaceState({ view, prev: null }, '', urlFor(view));
    show(view);
  } catch {
    app.innerHTML = `<div class="shell"><div class="boot"><span class="boot-orb"></span><span class="boot-word">Insp <em>Camera</em></span><p class="save-alert">無法開啟裝置儲存空間。請退出私密瀏覽模式，或允許此網站儲存資料後重新整理。</p></div></div>`;
  }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}
init();
