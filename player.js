'use strict';
const $ = id => document.getElementById(id);
const canvas = $('pet'), ctx = canvas.getContext('2d');
let cache = null, active = null, frame = 0, pos = 0, completedCycles = 0, buffering = 0;
let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
let loading = true, generation = 0, last = 0, customURL = null;
const controls = ['play', 'restart', 'prev', 'next', 'seek', 'download'];
function syncPlay() { $('play').textContent = playing ? 'Pausar' : 'Reproducir'; }
function draw() {
  const im = cache?.peek(frame);
  if (!im) {
    const ticket = generation, target = frame;
    $('status').textContent = 'Preparando fotograma…';
    cache?.get(frame, true).then(image => {
      if (image && ticket === generation && target === frame) draw();
    }).catch(error => failLoad(error, ticket));
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(im, 0, 0);
  $('seek').value = frame;
  $('time').textContent = (frame / active.fps).toFixed(2) + ' s';
  $('status').textContent = `${frame + 1} / ${active.frames}`;
  const ticket = generation;
  cache.prefetch(frame, error => failLoad(error, ticket));
}
function setLoading(value) {
  loading = value;
  controls.forEach(id => { $(id).disabled = value; });
}
function failLoad(error, ticket) {
  if (ticket !== generation) return;
  ++generation; cache?.dispose(); setLoading(true);
  $('status').textContent = 'No se han podido cargar los PNG. Comprueba que el paquete está completo y vuelve a seleccionar la animación.';
  $('status').classList.add('error'); console.error(error);
}
async function loadAnimation(a) {
  const ticket = ++generation;
  setLoading(true);
  cache?.dispose(); cache = new window.PichiFrameCache(a);
  active = a; frame = 0; pos = 0; completedCycles = 0; buffering = 0;
  canvas.width = a.width; canvas.height = a.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  resize();
  $('seek').max = a.frames - 1; $('seek').value = 0;
  $('time').textContent = '0.00 s';
  $('duration').textContent = (a.frames / a.fps).toFixed(2) + ' s';
  $('metadata').textContent = `${a.frames / a.fps} segundos · ${a.fps} fps · ${a.width} × ${a.height}`;
  $('title').textContent = a.name;
  $('status').classList.remove('error');
  $('status').textContent = 'Preparando animación…';
  document.querySelectorAll('.anim').forEach(b => {
    b.classList.toggle('active', b.dataset.id === a.id);
    b.setAttribute('aria-pressed', String(b.dataset.id === a.id));
  });
  try {
    await cache.warm(0);
    if (ticket !== generation) return;
    setLoading(false); last = performance.now(); draw();
  } catch (error) {
    failLoad(error, ticket);
  }
}
window.PEQUI.forEach((a, i) => {
  const b = document.createElement('button');
  b.className = 'anim'; b.dataset.id = a.id;
  const number = document.createElement('span'); number.textContent = String(i + 1).padStart(2, '0');
  b.append(number, document.createTextNode(' ' + a.name));
  b.onclick = () => loadAnimation(a); $('animations').append(b);
});
function clearSelection() {
  document.querySelectorAll('.bg').forEach(b => { b.classList.remove('selected'); b.setAttribute('aria-pressed', 'false'); });
  $('stage').classList.remove('check');
}
[['nieve','Nieve'], ['lago','Lago'], ['salon','Salón'], ['cocina','Cocina'], ['transparente','Sin fondo'], ['claro','Claro'], ['oscuro','Oscuro']].forEach(([id,label]) => {
  const b = document.createElement('button'); b.className = 'bg';
  const plain = ['transparente', 'claro', 'oscuro'].includes(id);
  b.innerHTML = (plain ? `<span class="swatch"${id === 'transparente' ? '' : ` style="background:${id === 'claro' ? '#f8f8f8' : '#18212d'}"`}></span>` : `<img src="fondos/${id}.jpg" alt="">`) + label;
  b.onclick = () => {
    clearSelection(); b.classList.add('selected'); b.setAttribute('aria-pressed', 'true');
    $('stage').style.backgroundImage = plain ? '' : `url("fondos/${id}.jpg")`;
    if (id === 'transparente') $('stage').classList.add('check');
    if (id === 'claro' || id === 'oscuro') $('stage').style.backgroundColor = id === 'claro' ? '#f8f8f8' : '#18212d';
  };
  $('backgrounds').append(b); if (id === 'nieve') b.click();
});
$('play').onclick = () => { playing = !playing; last = performance.now(); syncPlay(); };
$('restart').onclick = () => { frame = 0; pos = 0; completedCycles = 0; last = performance.now(); draw(); };
function step(n) {
  if (loading) return;
  playing = false; syncPlay(); frame = (frame + n + active.frames) % active.frames; pos = frame; draw();
}
$('prev').onclick = () => step(-1); $('next').onclick = () => step(1);
$('seek').oninput = () => { playing = false; syncPlay(); frame = Number($('seek').value); pos = frame; draw(); };
function resize() {
  if (!active) return;
  const requested = Number($('size').value), stage = $('stage');
  const width = Math.min(requested, stage.clientWidth || requested,
    (stage.clientHeight ? stage.clientHeight * .94 : requested) * active.width / active.height);
  canvas.style.width = width + 'px';
  canvas.style.height = (width * active.height / active.width) + 'px';
}
$('size').oninput = resize;
window.addEventListener?.('resize', resize);
$('color').oninput = () => { clearSelection(); $('stage').style.backgroundImage = 'none'; $('stage').style.backgroundColor = $('color').value; };
$('customBg').onchange = () => {
  const file = $('customBg').files[0]; if (!file) return;
  if (customURL) URL.revokeObjectURL(customURL);
  customURL = URL.createObjectURL(file); clearSelection(); $('stage').style.backgroundImage = `url("${customURL}")`;
};
$('download').onclick = () => {
  if (loading) return;
  const a = document.createElement('a'); a.href = cache.url(frame);
  a.download = `${active.id}_${String(frame).padStart(4, '0')}.png`; a.click();
};
function tick(now) {
  const dt = last ? (now - last) / 1000 : 0; last = now;
  if (playing && !loading && !document.hidden) {
    let nextPos = pos + dt * active.fps * Number($('speed').value);
    const wraps = Math.floor(nextPos / active.frames);
    if (nextPos >= active.frames) {
      if ($('loop').checked) nextPos %= active.frames;
      else nextPos = active.frames - 1;
    }
    const f = Math.floor(nextPos);
    if (cache.peek(f)) {
      pos = nextPos;
      if (wraps && $('loop').checked) completedCycles += wraps;
      if (wraps && !$('loop').checked) { playing = false; syncPlay(); }
      if (f !== frame) { frame = f; draw(); }
    } else {
      buffering++;
      const ticket = generation;
      cache.get(f, true).catch(error => failLoad(error, ticket));
    }
  }
  requestAnimationFrame(tick);
}
document.addEventListener('visibilitychange', () => { last = performance.now(); });
// Read-only diagnostics for reproducible browser checks; no network or telemetry.
window.pichiPlaybackState = () => ({ id: active?.id, frame, loading, playing, completedCycles, buffering,
  decodedFrames: cache?.loaded.size, decodedBytes: (cache?.loaded.size || 0) * (cache?.bytesPerFrame || 0),
  peakDecodedBytes: cache?.peakDecodedBytes, pending: cache?.pending.size, width: canvas.width, height: canvas.height });
syncPlay(); loadAnimation(window.PEQUI[0]); requestAnimationFrame(tick);
