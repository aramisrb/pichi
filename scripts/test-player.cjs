// Offline behavioural checks with a simulated DOM; this is not a browser test.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json')));
const source = fs.readFileSync(path.join(root, 'player.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
class Element {
  constructor(id) { this.id=id; this.value=''; this.style={}; this.dataset={}; this.children=[]; this.attributes={}; this.checked=true; this.width=256; this.height=256; this.classList={add(){},remove(){},toggle(){}}; }
  append(...items) { this.children.push(...items); }
  setAttribute(k,v) { this.attributes[k]=v; }
  getContext() { return {clearRect(){},drawImage(){}}; }
  click() { if(!this.disabled) this.onclick?.(); }
}
async function run(catalog) {
  const nodes=new Map(), callbacks=[]; let now=1000, failures=new Set(), downloads=[];
  const get=id=>{assert.ok(htmlIds.has(id),`Missing HTML element: ${id}`);if(!nodes.has(id))nodes.set(id,new Element(id));return nodes.get(id)};
  get('speed').value='1'; get('size').value='320';
  const document={hidden:false,getElementById:get,createTextNode:s=>s,addEventListener(){},
    querySelectorAll:sel=>get(sel==='.anim'?'animations':'backgrounds').children,
    createElement:tag=>{const e=new Element(tag);if(tag==='a')e.click=()=>downloads.push({href:e.href,name:e.download});return e;}};
  class Img {
    set src(value) { this._src=value;setImmediate(()=>{try{
      if(failures.has(value))throw Error('injected failure');
      const png=fs.readFileSync(path.join(root,value));this.naturalWidth=png.readUInt32BE(16);this.naturalHeight=png.readUInt32BE(20);this.onload();
    }catch(e){this.onerror();}}); }
    get src(){return this._src}
  }
  const context=vm.createContext({document,window:{PEQUI:catalog},Image:Img,matchMedia:()=>({matches:false}),performance:{now:()=>now},requestAnimationFrame:f=>callbacks.push(f),URL,console:{error(){}}});
  vm.runInContext(source,context);
  const settle=async()=>{for(let i=0;i<50;i++)await new Promise(setImmediate)};
  const tick=dt=>{now+=dt;callbacks.shift()(now)};
  await settle();
  for(const [i,a] of catalog.entries()) {
    get('animations').children[i].click();await settle();
    assert.equal(get('status').textContent,`1 / ${a.frames}`);
    assert.equal(Number(get('seek').max),a.frames-1);
    assert.equal(get('pet').width,a.width);
    assert.equal(get('duration').textContent,(a.frames/a.fps).toFixed(2)+' s');
    get('prev').click();assert.equal(Number(get('seek').value),a.frames-1);
    get('next').click();assert.equal(Number(get('seek').value),0);
    get('play').click();tick(1000/a.fps*1.1);assert.equal(Number(get('seek').value),1);
    get('restart').click();assert.equal(Number(get('seek').value),0);
    get('seek').value=a.frames-1;get('seek').oninput();get('loop').checked=false;get('play').click();tick(100);
    assert.equal(Number(get('seek').value),a.frames-1);assert.equal(get('play').textContent,'Reproducir');
    get('loop').checked=true;get('restart').click();get('speed').value='0.5';get('play').click();tick(2000/a.fps*1.1);
    assert.equal(Number(get('seek').value),1);get('speed').value='1';get('play').click();
    get('download').click();assert.equal(downloads.at(-1).href,`animaciones/${a.id}/frame_0001.png`);
  }
  // Race: the latest selection owns canvas, metadata and images.
  get('animations').children[0].click();get('animations').children.at(-1).click();await settle();
  assert.equal(get('title').textContent,catalog.at(-1).name);
  const failing=`animaciones/${catalog[0].id}/frame_0001.png`;failures.add(failing);
  get('animations').children[0].click();await settle();
  assert.match(get('status').textContent,/No se han podido/);assert.equal(get('download').disabled,true);
  failures.clear();get('animations').children[0].click();await settle();assert.equal(get('download').disabled,false);
  get('color').value='#18212d';get('color').oninput();assert.equal(get('stage').style.backgroundColor,'#18212d');
  get('size').value='400';get('size').oninput();assert.equal(get('pet').style.width,'400px');
  for(const b of get('backgrounds').children)b.click();
}
(async()=>{
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'manifest.js'),'utf8').replace(/^window.PEQUI\s*=\s*/, '').replace(/;\s*$/,'')),manifest);
 await run(manifest);
 await run([{...manifest[0],frames:7,fps:60,duration:7/60}]);
 for(const a of manifest)for(let i=0;i<a.frames;i++) {
  const rel=`animaciones/${a.id}/frame_${String(i).padStart(4,'0')}.png`;
  assert.ok(fs.existsSync(path.join(root,rel)));
  assert.equal(new URL(rel,'https://example.test/pichi/index.html').pathname,`/pichi/${rel}`);
 }
 console.log('PASS: seven sequences; dynamic count/fps; loading/races/errors; playback, step, seek, loop, speed, PNG download target, backgrounds; relative /pichi/ paths. Simulated DOM only.');
})().catch(e=>{console.error(e);process.exitCode=1});
