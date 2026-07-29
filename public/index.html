<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title>Servision Scout</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  :root {
    --bg:#0f1115; --panel:#171a21; --line:#262b36; --text:#e6e9ef;
    --muted:#8b93a3; --accent:#4f7cff; --good:#38c172; --warn:#f5a623;
    --dead:#6b7280; --demo:#a855f7;
  }
  * { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
  html,body { height:100%; background:var(--bg); color:var(--text);
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  #app { display:flex; flex-direction:column; height:100vh; }
  header { padding:12px 16px; border-bottom:1px solid var(--line);
    display:flex; align-items:center; justify-content:space-between; }
  header h1 { font-size:16px; font-weight:600; letter-spacing:.3px; }
  header .stat { font-size:12px; color:var(--muted); }
  .tabs { display:flex; border-bottom:1px solid var(--line); }
  .tabs button { flex:1; background:none; border:none; color:var(--muted);
    padding:12px; font-size:14px; font-weight:500; cursor:pointer; }
  .tabs button.active { color:var(--text); box-shadow:inset 0 -2px 0 var(--accent); }
  #map { flex:1; min-height:0; }
  .view { flex:1; overflow-y:auto; padding:12px 16px 80px; display:none; }
  .view.active { display:block; }
  #mapView.active { display:flex; flex-direction:column; }
  .filters { display:flex; gap:8px; padding:10px 16px; overflow-x:auto;
    border-bottom:1px solid var(--line); }
  .chip { background:var(--panel); border:1px solid var(--line); color:var(--muted);
    padding:6px 12px; border-radius:20px; font-size:13px; white-space:nowrap; cursor:pointer; }
  .chip.active { color:var(--text); border-color:var(--accent); }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:12px;
    padding:14px; margin-bottom:10px; cursor:pointer; }
  .card h3 { font-size:15px; margin-bottom:4px; display:flex; align-items:center; gap:8px; }
  .card .meta { font-size:12px; color:var(--muted); margin-bottom:6px; }
  .dot { width:8px; height:8px; border-radius:50%; display:inline-block; flex:none; }
  .badge { font-size:11px; padding:2px 8px; border-radius:10px; background:var(--line);
    color:var(--muted); }
  .stars { color:var(--warn); font-size:12px; letter-spacing:1px; }
  .fab { position:fixed; bottom:20px; right:20px; width:56px; height:56px;
    border-radius:50%; background:var(--accent); color:#fff; border:none;
    font-size:28px; cursor:pointer; box-shadow:0 4px 16px rgba(0,0,0,.4); z-index:500; }
  .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.6); display:none;
    align-items:flex-end; z-index:1000; }
  .modal-bg.show { display:flex; }
  .modal { background:var(--panel); width:100%; max-height:92vh; overflow-y:auto;
    border-radius:16px 16px 0 0; padding:20px 16px 40px; }
  .modal h2 { font-size:17px; margin-bottom:14px; }
  label { display:block; font-size:12px; color:var(--muted); margin:10px 0 4px; }
  input,select,textarea { width:100%; background:var(--bg); border:1px solid var(--line);
    color:var(--text); padding:10px; border-radius:8px; font-size:14px; font-family:inherit; }
  textarea { min-height:70px; resize:vertical; }
  .row { display:flex; gap:10px; }
  .row > div { flex:1; }
  .btn { width:100%; background:var(--accent); color:#fff; border:none; padding:13px;
    border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; margin-top:16px; }
  .btn.ghost { background:none; border:1px solid var(--line); color:var(--muted); margin-top:8px; }
  .btn.danger { background:none; border:1px solid #5b2330; color:#e06a7f; }
  .log { border-left:2px solid var(--line); padding:8px 0 8px 12px; margin:8px 0; }
  .log .k { font-size:11px; color:var(--accent); text-transform:uppercase; }
  .log .t { font-size:11px; color:var(--muted); }
  .empty { text-align:center; color:var(--muted); padding:40px 20px; font-size:14px; }
  .quickadd { display:flex; gap:8px; padding:10px 16px; border-bottom:1px solid var(--line); }
  .quickadd input { flex:1; }
  .quickadd button { background:var(--accent); border:none; color:#fff; padding:0 16px;
    border-radius:8px; font-weight:600; cursor:pointer; }
</style>
</head>
<body>
<div id="app">
  <header>
    <h1>🔭 Servision Scout</h1>
    <span class="stat" id="headerStat">—</span>
  </header>
  <div class="tabs">
    <button id="tabList" class="active" onclick="showTab('list')">Clients</button>
    <button id="tabMap" onclick="showTab('map')">Map</button>
    <button id="tabToday" onclick="showTab('today')">Agenda</button>
  </div>

  <div class="filters" id="filters"></div>

  <div id="listView" class="view active"></div>

  <div id="mapView" class="view">
    <div class="quickadd">
      <input id="mapSearch" placeholder="Search a Montreal address to drop a pin…"/>
      <button onclick="searchAddress()">Find</button>
    </div>
    <div id="map"></div>
  </div>

  <div id="todayView" class="view"></div>
</div>

<button class="fab" onclick="openModal()">+</button>

<div class="modal-bg" id="modalBg">
  <div class="modal" id="modalContent"></div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="/app.js"></script>
</body>
</html>
