'use strict';
const $ = id => document.getElementById(id);
const canvas = $('pet'), ctx = canvas.getContext('2d');
let images = [], active = null, frame = 0, pos = 0;
let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
let loading = true, generation = 0, last = 0, customURL = null;
const controls = ['play', 'restart', 'prev', 'next', 'seek', 'download'];
function syncPlay() { $('play').textContent = playing ? 'Pausar' : 'Reproducir'; }
function draw() {
  if (!images[frame]) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(images[frame], 0, 0);
  $('seek').value = frame;
  $('time').textContent = (frame / active.fps).toFixed(2) + ' s';
  $('status').textContent = `${frame + 1} / ${active.frames}`;
}
function setLoading(value) {
  loading = value;
  controls.forEach(id => { $(id).disabled = value; });
}
async function loadAnimation(a) {
  const ticket = ++generation;
  setLoading(true);
  active = a; images = []; frame = 0; pos = 0;
  canvas.width = a.width; canvas.height = a.height;
  resize();
  $('seek').max = a.frames - 1; $('seek').value = 0;
  $('time').textContent = '0.00 s';
  $('duration').textContent = (a.frames / a.fps).toFixed(2) + ' s';
  $('metadata').textContent = `${a.frames / a.fps} segundos · ${a.fps} fps`;
  $('title').textContent = a.name;
  $('status').classList.remove('error');
  $('status').textContent = `Cargando ${a.frames} fotogramas…`;
  document.querySelectorAll('.anim').forEach(b => {
    b.classList.toggle('active', b.dataset.id === a.id);
    b.setAttribute('aria-pressed', String(b.dataset.id === a.id));
  });
  let result = new Array(a.frames), done = 0, next = 0;
  try {
    async function worker() {
      while (next < a.frames && ticket === generation) {
        const i = next++;
        result[i] = await new Promise((resolve, reject) => {
          const im = new Image();
          im.onload = () => im.naturalWidth === a.width && im.naturalHeight === a.height
            ? resolve(im) : reject(Error(`Dimensiones incorrectas: ${im.src}`));
          im.onerror = () => reject(Error(`No se pudo cargar ${im.src}`));
          im.src = `animaciones/${a.id}/frame_${String(i).padStart(4, '0')}.png`;
        });
        if (ticket === generation) $('status').textContent = `Cargando ${++done} / ${a.frames}`;
      }
    }
    await Promise.all(Array.from({ length: Math.min(10, a.frames) }, worker));
    if (ticket !== generation) return;
    images = result; setLoading(false); last = performance.now(); draw();
  } catch (error) {
    if (ticket !== generation) return;
    ++generation; // Invalidate remaining workers, including their progress messages.
    $('status').textContent = 'No se han podido cargar los PNG. Comprueba que el paquete está completo y vuelve a seleccionar la animación.';
    $('status').classList.add('error');
    console.error(error);
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
$('restart').onclick = () => { frame = 0; pos = 0; last = performance.now(); draw(); };
function step(n) {
  if (loading) return;
  playing = false; syncPlay(); frame = (frame + n + active.frames) % active.frames; pos = frame; draw();
}
$('prev').onclick = () => step(-1); $('next').onclick = () => step(1);
$('seek').oninput = () => { playing = false; syncPlay(); frame = Number($('seek').value); pos = frame; draw(); };
function resize() {
  if (!active) return;
  canvas.style.width = $('size').value + 'px';
  canvas.style.height = (Number($('size').value) * active.height / active.width) + 'px';
}
$('size').oninput = resize;
$('color').oninput = () => { clearSelection(); $('stage').style.backgroundImage = 'none'; $('stage').style.backgroundColor = $('color').value; };
$('customBg').onchange = () => {
  const file = $('customBg').files[0]; if (!file) return;
  if (customURL) URL.revokeObjectURL(customURL);
  customURL = URL.createObjectURL(file); clearSelection(); $('stage').style.backgroundImage = `url("${customURL}")`;
};
$('download').onclick = () => {
  if (loading) return;
  const a = document.createElement('a'); a.href = images[frame].src;
  a.download = `${active.id}_${String(frame).padStart(4, '0')}.png`; a.click();
};
function tick(now) {
  const dt = last ? (now - last) / 1000 : 0; last = now;
  if (playing && !loading && !document.hidden) {
    pos += dt * active.fps * Number($('speed').value);
    if (pos >= active.frames) {
      if ($('loop').checked) pos %= active.frames;
      else { pos = active.frames - 1; playing = false; syncPlay(); }
    }
    const f = Math.floor(pos); if (f !== frame) { frame = f; draw(); }
  }
  requestAnimationFrame(tick);
}
document.addEventListener('visibilitychange', () => { last = performance.now(); });
syncPlay(); loadAnimation(window.PEQUI[0]); requestAnimationFrame(tick);
