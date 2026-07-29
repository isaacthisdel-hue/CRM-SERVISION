// Servision Scout — frontend logic

const STATUS = {
  prospect:  { label:'Prospect',  color:'#8b93a3' },
  contacted: { label:'Contacted', color:'#f5a623' },
  demo:      { label:'Demo done', color:'#a855f7' },
  client:    { label:'CLIENT',    color:'#38c172' },
  dead:      { label:'Dead',      color:'#6b7280' },
};

let clients = [];
let activeFilter = 'all';
let map, markers = {};
let editingId = null;

// --- Data ---------------------------------------------------------
async function load() {
  const res = await fetch('/api/clients');
  clients = await res.json();
  renderFilters();
  renderList();
  renderToday();
  renderMarkers();
  updateHeader();
}

async function updateHeader() {
  const res = await fetch('/api/stats');
  const s = await res.json();
  const clientCount = (s.byStatus.find(x => x.status === 'client') || {}).n || 0;
  document.getElementById('headerStat').textContent =
    `${s.total} leads · ${clientCount} signed`;
}

// --- Filters ------------------------------------------------------
function renderFilters() {
  const counts = { all: clients.length };
  for (const k in STATUS) counts[k] = clients.filter(c => c.status === k).length;
  const el = document.getElementById('filters');
  const chips = [['all','All']].concat(Object.keys(STATUS).map(k => [k, STATUS[k].label]));
  el.innerHTML = chips.map(([k,label]) =>
    `<div class="chip ${activeFilter===k?'active':''}" onclick="setFilter('${k}')">${label} ${counts[k]||0}</div>`
  ).join('');
}
function setFilter(k) { activeFilter = k; renderFilters(); renderList(); }

// --- List ---------------------------------------------------------
function renderList() {
  const el = document.getElementById('listView');
  let list = activeFilter === 'all' ? clients : clients.filter(c => c.status === activeFilter);
  if (!list.length) {
    el.innerHTML = `<div class="empty">No clients here yet.<br>Tap + to add your first one.</div>`;
    return;
  }
  el.innerHTML = list.map(cardHTML).join('');
}

function cardHTML(c) {
  const st = STATUS[c.status] || STATUS.prospect;
  const stars = c.modern_score ? '★'.repeat(c.modern_score) + '☆'.repeat(5-c.modern_score) : '';
  const next = c.next_action_date
    ? `<span class="badge">⏰ ${c.next_action_date}${c.next_action? ' · '+esc(c.next_action):''}</span>` : '';
  return `<div class="card" onclick="openModal(${c.id})">
    <h3><span class="dot" style="background:${st.color}"></span>${esc(c.name)}</h3>
    <div class="meta">${esc(c.neighborhood||'—')} · ${c.type} ${stars?'· <span class="stars">'+stars+'</span>':''}</div>
    <div>${next} ${c.owner_name?`<span class="badge">👤 ${esc(c.owner_name)}</span>`:''}</div>
  </div>`;
}

// --- Agenda / Today ----------------------------------------------
function renderToday() {
  const el = document.getElementById('todayView');
  const withDates = clients
    .filter(c => c.next_action_date)
    .sort((a,b) => a.next_action_date.localeCompare(b.next_action_date));
  if (!withDates.length) {
    el.innerHTML = `<div class="empty">No scheduled follow-ups.<br>Set a "next action date" on a client and it shows here.</div>`;
    return;
  }
  el.innerHTML = withDates.map(c => {
    const st = STATUS[c.status] || STATUS.prospect;
    return `<div class="card" onclick="openModal(${c.id})">
      <h3><span class="dot" style="background:${st.color}"></span>${esc(c.name)}</h3>
      <div class="meta">⏰ ${c.next_action_date} — ${esc(c.next_action||'follow up')}</div>
      <div class="meta">${esc(c.neighborhood||'')} ${c.contact?'· '+esc(c.contact):''}</div>
    </div>`;
  }).join('');
}

// --- Map ----------------------------------------------------------
function initMap() {
  if (map) return;
  map = L.map('map').setView([45.52, -73.6], 12); // Montreal
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'© OpenStreetMap', maxZoom:19
  }).addTo(map);
  map.on('click', e => {
    openModal(null, { lat:e.latlng.lat, lng:e.latlng.lng });
  });
  renderMarkers();
}

function renderMarkers() {
  if (!map) return;
  Object.values(markers).forEach(m => map.removeLayer(m));
  markers = {};
  clients.forEach(c => {
    if (c.lat == null || c.lng == null) return;
    const st = STATUS[c.status] || STATUS.prospect;
    const icon = L.divIcon({
      className:'', html:`<div style="width:16px;height:16px;border-radius:50%;
        background:${st.color};border:2px solid #fff;box-shadow:0 0 4px #000"></div>`,
      iconSize:[16,16], iconAnchor:[8,8]
    });
    const m = L.marker([c.lat, c.lng], { icon }).addTo(map);
    m.bindPopup(`<b>${esc(c.name)}</b><br>${st.label}<br>
      <a href="#" onclick="openModal(${c.id});return false;">Open</a>`);
    markers[c.id] = m;
  });
}

async function searchAddress() {
  const q = document.getElementById('mapSearch').value.trim();
  if (!q) return;
  // Free geocoding via OpenStreetMap Nominatim (no key). Bias to Montreal.
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q+', Montreal, QC')}`;
  try {
    const r = await fetch(url);
    const d = await r.json();
    if (d[0]) {
      const lat = parseFloat(d[0].lat), lng = parseFloat(d[0].lon);
      map.setView([lat,lng], 16);
      openModal(null, { lat, lng, address:d[0].display_name });
    } else { alert('Address not found — try adding a street number.'); }
  } catch(e) { alert('Search failed. Check connection.'); }
}

// --- Modal (add / edit) ------------------------------------------
function openModal(id = null, prefill = {}) {
  editingId = id;
  const c = id ? clients.find(x => x.id === id) : prefill;
  const isEdit = !!id;
  const v = k => (c && c[k] != null ? c[k] : (prefill[k] != null ? prefill[k] : ''));
  const sel = (val, opt) => val === opt ? 'selected' : '';

  let interactionsHTML = '';
  if (isEdit) {
    const logs = (c.interactions || []);
    interactionsHTML = `
      <label>Log an interaction</label>
      <div class="row">
        <div style="flex:0 0 110px">
          <select id="logKind">
            <option value="visit">Visit</option><option value="call">Call</option>
            <option value="message">Message</option><option value="note">Note</option>
          </select>
        </div>
        <div><input id="logBody" placeholder="What happened?"/></div>
      </div>
      <button class="btn ghost" onclick="addLog(${id})">Add to log</button>
      <div style="margin-top:12px">
        ${logs.length ? logs.map(l => `<div class="log">
            <span class="k">${esc(l.kind)}</span> <span class="t">${l.created_at}</span>
            <div>${esc(l.body||'')}</div></div>`).join('')
          : '<div class="meta">No interactions logged yet.</div>'}
      </div>`;
  }

  document.getElementById('modalContent').innerHTML = `
    <h2>${isEdit ? esc(c.name) : 'New prospect'}</h2>
    <label>Restaurant name *</label>
    <input id="f_name" value="${esc(v('name'))}"/>
    <div class="row">
      <div><label>Neighborhood</label><input id="f_neigh" value="${esc(v('neighborhood'))}"/></div>
      <div><label>Type</label><select id="f_type">
        <option value="independent" ${sel(v('type'),'independent')}>Independent</option>
        <option value="franchise" ${sel(v('type'),'franchise')}>Franchise</option>
      </select></div>
    </div>
    <label>Address</label><input id="f_addr" value="${esc(v('address'))}"/>
    <div class="row">
      <div><label>Status</label><select id="f_status">
        ${Object.keys(STATUS).map(k=>`<option value="${k}" ${sel(v('status')||'prospect',k)}>${STATUS[k].label}</option>`).join('')}
      </select></div>
      <div><label>Modern score (0-5)</label><select id="f_score">
        ${[0,1,2,3,4,5].map(n=>`<option value="${n}" ${sel(String(v('modern_score')||0),String(n))}>${n} ${'★'.repeat(n)}</option>`).join('')}
      </select></div>
    </div>
    <div class="row">
      <div><label>Owner name</label><input id="f_owner" value="${esc(v('owner_name'))}"/></div>
      <div><label>Contact</label><input id="f_contact" value="${esc(v('contact'))}" placeholder="phone / IG / email"/></div>
    </div>
    <div class="row">
      <div><label>Next action</label><input id="f_next" value="${esc(v('next_action'))}" placeholder="e.g. drop by with demo"/></div>
      <div><label>Date</label><input id="f_nextdate" type="date" value="${esc(v('next_action_date'))}"/></div>
    </div>
    <label>Notes</label>
    <textarea id="f_notes" placeholder="What hesitates them? What did you notice?">${esc(v('notes'))}</textarea>
    <input type="hidden" id="f_lat" value="${v('lat')}"/>
    <input type="hidden" id="f_lng" value="${v('lng')}"/>
    ${(v('lat')!=='' ) ? '<div class="meta" style="margin-top:8px">📍 pinned on map</div>' : ''}
    <button class="btn" onclick="save()">${isEdit?'Save changes':'Add prospect'}</button>
    ${interactionsHTML}
    ${isEdit ? `<button class="btn danger" onclick="del(${id})">Delete</button>` : ''}
    <button class="btn ghost" onclick="closeModal()">Cancel</button>
  `;
  document.getElementById('modalBg').classList.add('show');
}

function closeModal() {
  document.getElementById('modalBg').classList.remove('show');
  editingId = null;
}

async function save() {
  const g = id => document.getElementById(id).value;
  const payload = {
    name:g('f_name'), neighborhood:g('f_neigh'), type:g('f_type'), address:g('f_addr'),
    status:g('f_status'), modern_score:parseInt(g('f_score'))||0,
    owner_name:g('f_owner'), contact:g('f_contact'),
    next_action:g('f_next'), next_action_date:g('f_nextdate'), notes:g('f_notes'),
    lat:g('f_lat')?parseFloat(g('f_lat')):null, lng:g('f_lng')?parseFloat(g('f_lng')):null,
  };
  if (!payload.name.trim()) { alert('Name is required.'); return; }
  if (editingId) {
    await fetch(`/api/clients/${editingId}`, {method:'PUT',
      headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
  } else {
    await fetch('/api/clients', {method:'POST',
      headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
  }
  closeModal();
  await load();
}

async function del(id) {
  if (!confirm('Delete this client permanently?')) return;
  await fetch(`/api/clients/${id}`, {method:'DELETE'});
  closeModal();
  await load();
}

async function addLog(id) {
  const kind = document.getElementById('logKind').value;
  const body = document.getElementById('logBody').value.trim();
  if (!body) return;
  await fetch(`/api/clients/${id}/interactions`, {method:'POST',
    headers:{'Content-Type':'application/json'}, body:JSON.stringify({kind, body})});
  // refresh client + reopen
  await load();
  const fresh = await (await fetch(`/api/clients/${id}`)).json();
  const idx = clients.findIndex(x=>x.id===id);
  if (idx>=0) clients[idx] = fresh;
  openModal(id);
}

// --- Tabs ---------------------------------------------------------
function showTab(t) {
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
  document.getElementById(t+'View').classList.add('active');
  document.getElementById('tab'+t.charAt(0).toUpperCase()+t.slice(1)).classList.add('active');
  document.getElementById('filters').style.display = (t==='list')?'flex':'none';
  if (t==='map') { initMap(); setTimeout(()=>map.invalidateSize(), 100); }
}

// --- Util ---------------------------------------------------------
function esc(s) {
  return String(s==null?'':s).replace(/[&<>"']/g, m =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

load();
