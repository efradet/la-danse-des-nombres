// Isolated React DOM tests: no real browser, user session or network access.
// Audio is an external boundary; tests drive completion/error events explicitly.
import test, {before,after,beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createServer} from 'vite';
import React, {act} from 'react';
let win,server,App,root,createRoot;
const recordings=[];
class TestAudio {
  constructor(src){this.src=src;this.paused=false;recordings.push(this);}
  play(){return Promise.resolve();}
  pause(){this.paused=true;}
  finish(){this.onended?.();}
  fail(){this.onerror?.();}
}
before(async()=>{
  win=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'https://isolated-game.test'}).window;
  for(const [name,value] of Object.entries({window:win,document:win.document,navigator:win.navigator,localStorage:win.localStorage,Audio:TestAudio,IS_REACT_ACT_ENVIRONMENT:true}))Object.defineProperty(globalThis,name,{value,writable:true,configurable:true});
  ({createRoot}=await import('react-dom/client'));
  server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
  ({default:App}=await server.ssrLoadModule('/src/App.jsx'));
});
after(async()=>{await server?.close();win?.close();});
beforeEach(async()=>{win.localStorage.clear();recordings.length=0;root=createRoot(document.getElementById('root'));await act(async()=>root.render(React.createElement(App)));});
afterEach(async()=>{await act(async()=>root.unmount());});
const workshop=()=>document.querySelector('.number-workshop');
function button(label,scope=document){
  const found=[...scope.querySelectorAll('button')].find(b=>b.textContent.trim().startsWith(label));
  assert.ok(found,`Button ${label} exists`);return found;
}
async function click(element){assert.ok(!element.disabled,'Control is enabled');await act(async()=>element.dispatchEvent(new win.MouseEvent('click',{bubbles:true})));}
const clickText=(label,scope)=>click(button(label,scope));
async function hear(){await clickText('Écouter le nombre',workshop());const audio=recordings.at(-1);await act(async()=>audio.finish());return Number(audio.src.match(/\/(\d+)\.mp3$/)[1]);}
async function answerOption(target){const option=[...workshop().querySelectorAll('.number-options button')].find(b=>b.textContent===String(target));await click(option);}
async function keyNumber(target){for(const digit of String(target)){const key=[...workshop().querySelectorAll('.keypad button')].find(b=>b.textContent===digit);await click(key);}await clickText('Valider mon nombre',workshop());}

test('recognition requires audio, errors preserve drawing, and repeated correct actions cannot progress twice',async()=>{
  await clickText('J’écoute et je choisis');
  assert.equal(workshop().querySelectorAll('.number-options button').length,4);
  assert.ok([...workshop().querySelectorAll('.number-options button')].every(b=>b.disabled));
  const target=await hear();
  const wrong=[...workshop().querySelectorAll('.number-options button')].find(b=>b.textContent!==String(target));
  await click(wrong);
  assert.equal(workshop().querySelector('[role=progressbar]').getAttribute('aria-valuenow'),'0');
  await answerOption(target);
  assert.equal(workshop().querySelector('[role=progressbar]').getAttribute('aria-valuenow'),'1');
  assert.equal(workshop().querySelectorAll('.number-options button').length,0);
  await clickText('Le nombre suivant',workshop());
  assert.ok([...workshop().querySelectorAll('.number-options button')].every(b=>b.disabled));
});
test('completed listening drawing is saved once and survives a new React mount',async()=>{
  await clickText('J’écoute et je choisis');
  for(let i=0;i<8;i++){const target=await hear();await answerOption(target);if(i<7)await clickText('Le nombre suivant',workshop());}
  assert.ok(button('Rejouer à ce palier',workshop()).disabled);
  await clickText('Mettre dans ma grotte',workshop());
  await clickText('Voir ma grotte',workshop());
  assert.equal(document.querySelectorAll('.treasure-card').length,1);
  await act(async()=>root.unmount());root=createRoot(document.getElementById('root'));await act(async()=>root.render(React.createElement(App)));
  await clickText('Ma grotte');assert.equal(document.querySelectorAll('.treasure-card').length,1);
});
test('keypad activity starts below 20 and allows the 100 level without showing the answer',async()=>{
  await clickText('J’écoute et j’écris');
  assert.ok(workshop().textContent.includes('Nombres de 0 à 19'));
  assert.ok(workshop().querySelector('.number-entry').disabled);
  const target=await hear();await keyNumber(target);
  assert.equal(workshop().querySelector('[role=progressbar]').getAttribute('aria-valuenow'),'1');
  await clickText('Réglages avec un adulte',workshop());
  const select=workshop().querySelector('select');
  await act(async()=>{select.value='4';select.dispatchEvent(new win.Event('change',{bubbles:true}));});
  assert.ok(workshop().textContent.includes('Nombres de 0 à 100'));
  assert.equal(workshop().querySelector('.number-entry').value,'');
  const big=await hear();assert.ok(big>=0&&big<=100);await keyNumber(big);
  assert.equal(workshop().querySelector('[role=progressbar]').getAttribute('aria-valuenow'),'1');
});
test('navigation stops playback, ignores stale ended events and preserves sessions',async()=>{
  await clickText('J’écoute et je choisis');await clickText('Écouter le nombre',workshop());
  const audio=recordings.at(-1),late=audio.onended;
  await clickText('J’écoute et j’écris');assert.ok(audio.paused);
  await act(async()=>late());assert.ok(workshop().querySelector('.number-entry').disabled);
  await clickText('J’écoute et je choisis');const target=await hear();await answerOption(target);
  await clickText('Ma grotte');assert.ok(workshop().hidden);
  await clickText('Retour à l’atelier'.replace('’',"'"));
  assert.equal(workshop().querySelector('[role=progressbar]').getAttribute('aria-valuenow'),'1');
  await clickText('Additions colorées');assert.ok(document.querySelector('[aria-label="Ton addition"]'));
});
test('audio failure announces the problem and leaves all answers locked',async()=>{
  await clickText('J’écoute et je choisis');await clickText('Écouter le nombre',workshop());
  await act(async()=>recordings.at(-1).fail());
  assert.ok(workshop().querySelector('[role=alert]'));
  assert.ok([...workshop().querySelectorAll('.number-options button')].every(b=>b.disabled));
});
test('success is announced and focus moves to the next question control',async()=>{
  await clickText('J’écoute et je choisis');const target=await hear();await answerOption(target);
  assert.ok(workshop().querySelector('[role=status]')?.textContent.includes('Bravo'));
  assert.equal(document.activeElement,button('Le nombre suivant',workshop()));
});

