/* =========================================================
   PENJAJAHAN — interactive map
   Reads RULERS, STATES, BRUNEI, KEY_MOMENTS from data.js
   ========================================================= */

const SVG_NS = 'http://www.w3.org/2000/svg';
const MIN_YEAR = 1500;
const MAX_YEAR = 1963;

// Map projection: turns [latitude, longitude] into x/y pixels on the SVG.
// East Malaysia (Borneo) is moved 4 degrees west so both parts fit side by side.
const SCALE = 60;
const LON_LEFT = 99.55, LON_RIGHT = 115.45;
const LAT_TOP = 7.3, LAT_BOTTOM = 0.7;
const BORNEO_SHIFT = 4.0;
const WIDTH = (LON_RIGHT - LON_LEFT) * SCALE;
const HEIGHT = (LAT_TOP - LAT_BOTTOM) * SCALE;

function project([lat, lon]) {
  if (lon > 108) lon -= BORNEO_SHIFT;
  return [(lon - LON_LEFT) * SCALE, (LAT_TOP - lat) * SCALE];
}

function ringToPath(ring) {
  return ring.map((point, i) => {
    const [x, y] = project(point);
    return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
  }).join(' ') + ' Z';
}

// ---------- Page elements ----------
const svg = document.getElementById('map');
const slider = document.getElementById('slider');
const yearEl = document.getElementById('year');
const legendEl = document.getElementById('legend');
const panel = document.getElementById('panel');
const tooltip = document.getElementById('tooltip');
const playBtn = document.getElementById('play');
const ticksEl = document.getElementById('ticks');
const mapCard = document.querySelector('.map-card');

// ---------- State of the page ----------
let year = MIN_YEAR;
let selectedId = null;
let playTimer = null;

const stateEls = {}; // id -> { group, paths, label }

// ---------- Helpers ----------
function periodAt(state, y) {
  let index = 0;
  state.periods.forEach((p, i) => { if (p[0] <= y) index = i; });
  const [from, ruler, note] = state.periods[index];
  const next = state.periods[index + 1];
  return { index, from, to: next ? next[0] : null, ruler, note };
}

// Dark text on light colours, light text on dark colours
function textColorFor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#1C1B17' : '#F3EDE0';
}

function latestMoment(y) {
  let found = START_MOMENT;
  KEY_MOMENTS.forEach(m => { if (m.year <= y) found = m; });
  return found;
}

function el(tag, attrs = {}, parent) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (parent) parent.appendChild(node);
  return node;
}

// ---------- Build the map (runs once) ----------
function buildMap() {
  svg.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

  // Sea label + dashed line showing the shortened gap
  const sea = el('text', { class: 'sea-label', x: project([5.7, 106.4])[0], y: project([5.7, 106.4])[1] }, svg);
  sea.textContent = 'South China Sea';
  const [gx, gy1] = project([3.4, 105.0]);
  const [, gy2] = project([0.9, 105.0]);
  el('line', { class: 'gap-line', x1: gx, y1: gy1, x2: gx, y2: gy2 }, svg);

  const statesGroup = el('g', { class: 'states' }, svg);

  // Brunei (context only) — drawn on top of Sarawak
  const brunei = el('g', { class: 'neutral', 'aria-hidden': 'true' }, svg);
  BRUNEI.shape.forEach(ring => el('path', { d: ringToPath(ring) }, brunei));
  const [bx, by] = project(BRUNEI.label);
  el('text', { x: bx, y: by }, brunei).textContent = 'Brunei';

  const labelsGroup = el('g', { class: 'labels' }, svg);

  STATES.forEach(state => {
    const group = el('g', {
      class: 'state',
      tabindex: '0',
      role: 'button',
      'data-id': state.id
    }, statesGroup);

    const paths = state.shape.map(ring => el('path', { d: ringToPath(ring) }, group));

    // Small states get a bigger invisible circle so they are easy to tap
    if (state.small) {
      const pts = state.shape[0].map(project);
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      el('circle', { class: 'hit', cx, cy, r: 14 }, group);
    }

    const [lx, ly] = project(state.label);
    const label = el('text', { x: lx, y: ly }, labelsGroup);
    label.textContent = state.shortName || state.name;
    if (state.labelAnchor) label.style.textAnchor = state.labelAnchor;
    if (state.labelSize) label.style.fontSize = state.labelSize + 'px';
    if (state.small || state.labelOutside) label.classList.add('outside');

    // Interactions
    group.addEventListener('click', () => selectState(state.id));
    group.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectState(state.id); }
    });
    group.addEventListener('mousemove', e => showTooltip(state, e));
    group.addEventListener('mouseleave', hideTooltip);
    group.addEventListener('focus', () => showTooltip(state));
    group.addEventListener('blur', hideTooltip);

    stateEls[state.id] = { group, paths, label };
  });

  // Small ship for the opening voyage (hidden until it sails)
  voyageShip = el('g', { class: 'voyage-ship', 'aria-hidden': 'true' }, svg);
  const bob = el('g', { class: 'voyage-bob' }, voyageShip);
  el('use', { href: '#ship', x: -24, y: -31, width: 48, height: 36 }, bob);
}

// ---------- Legend, slider ticks, key moments (run once) ----------
function buildLegend() {
  Object.entries(RULERS).forEach(([key, r]) => {
    const li = document.createElement('li');
    li.dataset.ruler = key;
    li.innerHTML = `<span class="swatch" style="background:${r.color}"></span>${r.label}`;
    legendEl.appendChild(li);
  });
}

function buildTicks() {
  KEY_MOMENTS.forEach(m => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tick';
    btn.dataset.year = m.year;
    btn.style.left = ((m.year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR) * 100) + '%';
    btn.title = `${m.year}: ${m.text}`;
    btn.setAttribute('aria-label', `Jump to ${m.year}: ${m.text}`);
    btn.addEventListener('click', () => { stopPlay(); cancelVoyage(); setYear(m.year); });
    ticksEl.appendChild(btn);
  });
}

// ---------- Update everything for the current year ----------
function render() {
  yearEl.textContent = year;
  slider.value = year;
  slider.style.setProperty('--p', ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR) * 100) + '%');

  const present = new Set();

  STATES.forEach(state => {
    const { ruler } = periodAt(state, year);
    const color = RULERS[ruler].color;
    const { group, paths, label } = stateEls[state.id];
    present.add(ruler);

    paths.forEach(p => p.style.fill = color);
    if (!state.small && !state.labelOutside) label.style.fill = textColorFor(color);
    group.setAttribute('aria-label', `${state.name}: ${RULERS[ruler].label} in ${year}`);
  });

  legendEl.querySelectorAll('li').forEach(li => {
    li.classList.toggle('absent', !present.has(li.dataset.ruler));
  });

  ticksEl.querySelectorAll('.tick').forEach(t => {
    t.classList.toggle('passed', Number(t.dataset.year) <= year);
  });

  renderPanel(latestMoment(year));
}

function renderPanel(moment) {
  if (selectedId) {
    renderStatePanel(STATES.find(s => s.id === selectedId));
  } else {
    renderOverview(moment);
  }
}

// Overview: how many states each power held this year
function renderOverview(moment) {
  const counts = {};
  STATES.forEach(s => {
    const r = periodAt(s, year).ruler;
    counts[r] = (counts[r] || 0) + 1;
  });
  const total = STATES.length;
  const order = Object.keys(RULERS).filter(k => counts[k]);

  const bar = order.map(k =>
    `<span style="width:${counts[k] / total * 100}%;background:${RULERS[k].color}"></span>`
  ).join('');

  const list = order.map(k =>
    `<li><span class="swatch" style="background:${RULERS[k].color}"></span>${RULERS[k].label}
       <span class="count">${counts[k]} of ${total}</span></li>`
  ).join('');

  panel.innerHTML = `
    <p class="eyebrow">Overview</p>
    <h2>Who ruled in ${year}</h2>
    <div class="panel-grid">
      <div>
        <div class="stack" role="img" aria-label="Share of states by ruler">${bar}</div>
        <ul class="counts">${list}</ul>
      </div>
      <div>
        <div class="event-card">
          <span class="event-year">${moment.year}</span>
          <p>${moment.text}</p>
        </div>
        <p class="hint">Tap a state on the map to read its story.</p>
      </div>
    </div>`;
}

// One state's story and timeline
function renderStatePanel(state) {
  const now = periodAt(state, year);
  const ruler = RULERS[now.ruler];

  const rows = state.periods.map((p, i) => {
    const next = state.periods[i + 1];
    const years = next ? `${p[0]}–${next[0]}` : `from ${p[0]}`;
    const r = RULERS[p[1]];
    return `<li><button type="button" data-year="${p[0]}" class="${i === now.index ? 'current' : ''}" title="${p[2]}">
        <span class="swatch" style="background:${r.color}"></span>
        <span class="p-years">${years}</span>
        <span class="p-label">${r.label}</span>
      </button></li>`;
  }).join('');

  panel.innerHTML = `
    <button type="button" class="back" data-action="back">← All states</button>
    <p class="eyebrow">State</p>
    <h2>${state.name}</h2>
    <div class="panel-grid">
      <div>
        <p class="ruler-now"><span class="swatch" style="background:${ruler.color}"></span>
          <span>In ${year}: <strong>${ruler.label}</strong></span></p>
        <p class="period-note">${now.note}</p>
        <p class="story">${state.story}</p>
      </div>
      <div>
        <h3>Timeline</h3>
        <ol class="periods">${rows}</ol>
      </div>
    </div>`;
}

// Clicks inside the panel (back button, timeline rows)
panel.addEventListener('click', e => {
  const back = e.target.closest('[data-action="back"]');
  if (back) { selectState(null); return; }
  const row = e.target.closest('button[data-year]');
  if (row) { stopPlay(); cancelVoyage(); setYear(Number(row.dataset.year)); }
});

// ---------- Selecting a state ----------
function selectState(id) {
  if (selectedId) stateEls[selectedId].group.classList.remove('selected');
  selectedId = (id === selectedId) ? null : id; // clicking again closes it

  if (selectedId) {
    const { group } = stateEls[selectedId];
    group.classList.add('selected');
    group.parentNode.appendChild(group); // bring to front so the outline shows fully
  }
  renderPanel(latestMoment(year));

  // The story is under the map now, so scroll just enough to bring it into view
  if (selectedId) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && selectedId) selectState(null);
});

// ---------- Tooltip ----------
function showTooltip(state, event) {
  const { ruler } = periodAt(state, year);
  const r = RULERS[ruler];
  tooltip.innerHTML = `<strong>${state.name}</strong>
    <span><span class="swatch" style="background:${r.color}"></span>${r.label}</span>`;
  tooltip.hidden = false;

  const cardBox = mapCard.getBoundingClientRect();
  let x, y;
  if (event) {
    x = event.clientX - cardBox.left;
    y = event.clientY - cardBox.top;
  } else {
    const box = stateEls[state.id].group.getBoundingClientRect();
    x = box.left + box.width / 2 - cardBox.left;
    y = box.top - cardBox.top;
  }
  const tipW = tooltip.offsetWidth;
  const left = Math.min(Math.max(x - tipW / 2, 8), cardBox.width - tipW - 8);
  tooltip.style.left = left + 'px';
  tooltip.style.top = (y - tooltip.offsetHeight - 14) + 'px';
}

function hideTooltip() { tooltip.hidden = true; }

// ---------- Slider + play button ----------
function setYear(y) {
  year = Math.max(MIN_YEAR, Math.min(MAX_YEAR, y));
  render();
}

slider.addEventListener('input', () => { stopPlay(); cancelVoyage(); setYear(Number(slider.value)); });

function startPlay() {
  cancelVoyage();
  if (year >= MAX_YEAR) setYear(MIN_YEAR);
  playBtn.textContent = '❚❚';
  playBtn.setAttribute('aria-label', 'Pause');
  playTimer = setInterval(() => {
    if (year >= MAX_YEAR) { stopPlay(); return; }
    setYear(year + 2);
  }, 70);
}

function stopPlay() {
  clearInterval(playTimer);
  playTimer = null;
  playBtn.textContent = '▶';
  playBtn.setAttribute('aria-label', 'Play through time');
}

playBtn.addEventListener('click', () => (playTimer ? stopPlay() : startPlay()));

// ---------- Opening voyage: a ship sails down the Strait of Melaka to Melaka (1500 → 1511) ----------
const VOYAGE_ROUTE = [[5.7, 99.15], [5.0, 99.75], [4.0, 100.3], [3.0, 100.9], [2.4, 101.6], [2.14, 102.16]];
const VOYAGE_MS = 5000;
let voyageShip = null;
let voyageFrame = null;
let voyageTimer = null;

function startVoyage() {
  cancelVoyage();
  stopPlay();
  setYear(MIN_YEAR);

  // Work out the length of each leg of the route
  const pts = VOYAGE_ROUTE.map(project);
  const legs = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const len = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    legs.push(len);
    total += len;
  }

  function pointAt(dist) {
    for (let i = 0; i < legs.length; i++) {
      if (dist <= legs[i]) {
        const t = dist / legs[i];
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t];
      }
      dist -= legs[i];
    }
    return pts[pts.length - 1];
  }

  let startTime = null;
  voyageShip.classList.add('sailing');

  function step(now) {
    if (startTime === null) startTime = now;
    const k = Math.min(1, (now - startTime) / VOYAGE_MS);
    const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // slow start, slow stop
    const [x, y] = pointAt(eased * total);
    voyageShip.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);

    const shownYear = MIN_YEAR + Math.floor(eased * 11); // years tick from 1500 towards 1511
    if (shownYear !== year) setYear(shownYear);

    if (k < 1) {
      voyageFrame = requestAnimationFrame(step);
    } else {
      voyageFrame = null;
      setYear(1511); // arrive: Melaka turns Portuguese
      voyageTimer = setTimeout(() => voyageShip.classList.remove('sailing'), 3500);
    }
  }
  voyageFrame = requestAnimationFrame(step);
}

function cancelVoyage() {
  if (voyageFrame) cancelAnimationFrame(voyageFrame);
  clearTimeout(voyageTimer);
  voyageFrame = null;
  if (voyageShip) voyageShip.classList.remove('sailing');
}

// ---------- Start ----------
buildMap();
buildLegend();
buildTicks();
setYear(MIN_YEAR);
