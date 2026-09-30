import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Brush, Check, ChevronLeft, Delete, Ear, Gem, Heart, Keyboard, Lightbulb, LockKeyhole, Maximize2, Paintbrush, Palette, Sparkles, Star, X } from 'lucide-react';
import { ARTWORKS } from './artworks.js';
import { PALETTE } from './palette.js';
import { createGame, submitAnswer, paintZone } from './game.js';
import { loadTreasures, makeTreasure, saveTreasure } from './treasures.js';
import Painting from './Painting.jsx';
import NumberWorkshop from './NumberWorkshop.jsx';

const browserStorage = { getItem: key => window.localStorage.getItem(key), setItem: (key,value) => window.localStorage.setItem(key,value) };
const initialGames = () => Object.fromEntries(ARTWORKS.map(art=>[art.id,createGame(art)]));

function Modal({ title, children, onClose }) {
  const ref = useRef(null);
  useEffect(()=> { const dialog = ref.current; dialog.showModal(); return ()=>dialog.close(); },[]);
  return <dialog ref={ref} onCancel={onClose} onClick={e=> { if(e.target===ref.current) onClose(); }} className="art-dialog">
    <div className="dialog-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Fermer"><X/></button></div>{children}
  </dialog>;
}

export default function App() {
  const [games,setGames] = useState(initialGames), gamesRef = useRef(games);
  const [active,setActive] = useState(ARTWORKS[0].id), [view,setView] = useState('atelier');
  const [activity,setActivity] = useState('addition');
  const [answer,setAnswer] = useState(''), [hint,setHint] = useState(false), [notice,setNotice] = useState('');
  const [collection,setCollection] = useState(()=>loadTreasures(browserStorage,ARTWORKS)), collectionRef = useRef(collection);
  const [modal,setModal] = useState(null), inputRef = useRef(null);
  const game = games[active], art = game.artwork, question = game.question;
  const brush = game.phase === 'paint', complete = game.phase === 'complete';
  const color = brush ? PALETTE[question.sum] : null;
  const total = art.zones.length, count = game.colored.length;
  const activityRef = useRef(null);
  const listeningActivityRef = useRef(null);
  activityRef.current = { view, activity, drawing: art.title, phase: game.phase,
    addition: question ? { a: question.a, b: question.b } : null,
    brushNumber: brush ? question.sum : null, coloredZones: count, totalZones: total,
    treasureCount: collection.items.length };
  useEffect(()=> {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(context.registerTool({ name:'get_activity_state', title:'Consulter le jeu en cours',
        description:'Read the current painting, addition, earned brush and progress without changing the game.',
        inputSchema:{type:'object',properties:{},additionalProperties:false},
        annotations:{readOnlyHint:true,untrustedContentHint:false},
        execute(input) {
          if(!input || typeof input!=='object' || Array.isArray(input) || Object.keys(input).length) throw new Error('Expected an empty object.');
          return activityRef.current.activity==='addition' ? {...activityRef.current} : {...listeningActivityRef.current,view:activityRef.current.view,treasureCount:activityRef.current.treasureCount};
        }
      },{signal:lifecycle.signal})).catch(()=>{});
    } catch { /* Optional browser capability; the game remains fully usable. */ }
    return ()=>lifecycle.abort();
  },[]);

  const update = next => { const updated = {...gamesRef.current,[active]:next}; gamesRef.current=updated; setGames(updated); };
  useEffect(()=> {
    let saved = collectionRef.current;
    for(const current of Object.values(games)) {
      if(current.phase === 'complete' && !saved.items.some(t=>t.id===current.id)) {
        saved = saveTreasure(saved.items,makeTreasure(current),browserStorage);
      }
    }
    if(saved !== collectionRef.current) { collectionRef.current=saved; setCollection(saved); }
  },[games]);

  function choose(id) { setActive(id); setAnswer(''); setHint(false); setNotice(''); }
  function submit(event) {
    event?.preventDefault();
    const current=gamesRef.current[active];
    const next=submitAnswer(current,answer);
    update(next); setNotice('');
    if(next.phase==='paint') setHint(false);
    else if(next.feedbackKind==='try') { inputRef.current?.focus(); inputRef.current?.select(); }
  }
  function paint(id) {
    const current=gamesRef.current[active], next=paintZone(current,id);
    if(next===current) {
      if(current.phase==='answer') setNotice('Trouve la bonne réponse pour gagner ta couleur.');
      else if(current.phase==='paint') setNotice(`Choisis une zone blanche avec le nombre ${current.question.sum}.`);
      return;
    }
    update(next); setAnswer(''); setHint(false); setNotice('');
  }
  function digit(value) { setAnswer(old=>old.length>=2 ? String(value) : old==='0' ? String(value) : old+value); }
  function restart() { update(createGame(art)); setAnswer(''); setHint(false); setNotice(''); }
  const feedback = notice || game.feedback;
  function collectListeningTreasure(treasure) {
    const saved=saveTreasure(collectionRef.current.items,treasure,browserStorage);
    collectionRef.current=saved;setCollection(saved);
  }

  return <>
    <header className="site-header"><div className="header-inner">
      <a className="brand" href="#" onClick={e=>{e.preventDefault();setView('atelier');}} aria-label="La danse des nombres, atelier"><span className="brand-mark"><b>1</b><i>2</i><em>3</em><Sparkles size={13}/></span><span>La danse<span className="brand-second">des nombres<span className="brand-dot">.</span></span></span></a>
      <nav aria-label="Navigation principale"><button className={view==='atelier'?'nav-item selected':'nav-item'} onClick={()=>setView('atelier')}><Paintbrush size={19}/>Mon atelier</button><button className={view==='grotte'?'nav-item selected':'nav-item'} onClick={()=>setView('grotte')}><Gem size={19}/>Ma grotte<span className="treasure-count">{collection.items.length}</span></button></nav>
      <div className="profile"><span className="avatar">É</span><span>Elisabeth<small>Petite artiste, grande magie</small></span><Star className="profile-star" size={19}/></div>
    </div></header>
    <main>
    {view==='atelier'&&<nav className="activity-switch" aria-label="Choisis ton jeu"><button className={activity==='addition'?'active':''} aria-pressed={activity==='addition'} onClick={()=>setActivity('addition')}><Paintbrush size={20}/><span>Additions colorées<small>Je calcule et je colorie</small></span></button><button className={activity==='recognize'?'active':''} aria-pressed={activity==='recognize'} onClick={()=>setActivity('recognize')}><Ear size={20}/><span>J’écoute et je choisis<small>Je retrouve le bon nombre</small></span></button><button className={activity==='write'?'active':''} aria-pressed={activity==='write'} onClick={()=>setActivity('write')}><Keyboard size={20}/><span>J’écoute et j’écris<small>J’utilise les touches</small></span></button></nav>}
    <NumberWorkshop mode={activity==='write'?'write':'recognize'} visible={view==='atelier'&&activity!=='addition'} treasures={collection.items} onTreasure={collectListeningTreasure} onCave={()=>setView('grotte')} reportRef={listeningActivityRef}/>
    {view==='atelier'&&activity==='addition' ? <>
      <section className="welcome"><div><div className="eyebrow"><Sparkles size={14}/> UN PEU DE CALCUL, BEAUCOUP DE MAGIE</div><h1>À toi de faire danser les couleurs<span> !</span></h1><p>Une addition réussie, une zone coloriée. Et un trésor à la fin !</p></div><span className="gentle-note"><Heart size={16}/> À ton rythme</span></section>
      <section className="art-picker" aria-label="Choisis ton dessin">{ARTWORKS.map(item=><button key={item.id} onClick={()=>choose(item.id)} className={`art-choice ${active===item.id?'active':''}`} aria-pressed={active===item.id}><span className={`art-thumb thumb-${item.id}`}><Painting art={item} preview/></span><span>{item.title}<small>{games[item.id].colored.length ? `${games[item.id].colored.length}/${item.zones.length} zones` : item.theme}</small></span>{active===item.id && <span className="choice-check"><Check size={12}/></span>}</button>)}</section>
      <div className="play-layout">
        <section className={`canvas-card ${brush?'brush-ready':''}`} aria-label="Ton coloriage">
          <div className="canvas-header"><div><span className="eyebrow">MA PEINTURE</span><h2>{art.title}<span className="art-subtitle">{art.subtitle}</span></h2></div><button className="icon-button" onClick={()=>setModal({type:'zoom'})} aria-label="Agrandir le dessin"><Maximize2 size={19}/></button></div>
          <div className="canvas-paper"><span className="paper-corner corner-left"/><span className="paper-corner corner-right"/><Painting art={art} colored={game.colored} onPaint={paint} phase={game.phase} sum={question?.sum}/>{complete && <div className="finished-ribbon"><Sparkles size={17}/> Une merveille de plus !</div>}</div>
          <div className="canvas-footer"><div className="progress-label"><span><Palette size={17}/><strong>{count}</strong> / {total} zones coloriées</span><span>{complete ? 'Bravo !' : 'Petit à petit, la magie apparaît'}</span></div><div className="progress-track" role="progressbar" aria-label="Zones coloriées" aria-valuenow={count} aria-valuemin={0} aria-valuemax={total}><span style={{width:`${count/total*100}%`}}/></div></div>
        </section>
        <aside className={`exercise-card ${brush?'is-ready':''}`} aria-label="Ton addition">
          {complete ? <div className="completion"><div className="completion-gem"><Gem size={48}/><Sparkles size={26}/></div><span className="eyebrow">UN NOUVEAU TRÉSOR</span><h2>Bravo, Elisabeth !</h2><p>Ta peinture a rejoint la grotte au trésor des nombres.</p><button className="primary" onClick={()=>setView('grotte')}><Gem size={18}/> Voir ma grotte <ArrowRight size={17}/></button><button className="secondary" onClick={restart}>Recommencer ce dessin</button><div className="confetti" aria-hidden="true">✦ · ✧ · ✦</div></div> : <>
            <div className="exercise-heading"><span className="step-badge">{brush?'2':'1'}</span><div><h2>{brush?'À toi de peindre !':'La petite addition'}</h2><p>{brush?'Une couleur, une seule zone.':'Trouve le résultat pour gagner ta couleur.'}</p></div><Sparkles className="heading-sparkle" size={21}/></div>
            <form onSubmit={submit}>
              <div className={`equation ${brush?'solved':''}`} aria-label={`${question.a} plus ${question.b}`}><span>{question.a}</span><b>+</b><span>{question.b}</span><b>=</b>{brush ? <span className="solved-answer">{question.sum}<Check size={14}/></span> : <input ref={inputRef} aria-label="Ta réponse" inputMode="numeric" autoComplete="off" value={answer} placeholder="?" maxLength={2} onChange={e=> {if(/^\d{0,2}$/.test(e.target.value))setAnswer(e.target.value);}}/>}</div>
              {brush ? <div className="brush-instruction"><div className="paint-pot" style={{'--paint':color.hex}}><Paintbrush size={36}/><b>{question.sum}</b></div><h3>Tu as gagné le {color.name} !</h3><p>Sur le dessin, choisis <strong>une zone {question.sum}</strong>.</p><div className="one-brush"><Check size={16}/> 1 coloriage disponible</div></div> : <>
                <div className="keypad" aria-label="Pavé numérique">{[1,2,3,4,5,6,7,8,9].map(n=><button type="button" key={n} onClick={()=>digit(n)}>{n}</button>)}<button type="button" className="clear-key" onClick={()=>setAnswer('')} aria-label="Effacer la réponse">C</button><button type="button" onClick={()=>digit(0)}>0</button><button type="button" className="delete-key" onClick={()=>setAnswer(s=>s.slice(0,-1))} aria-label="Effacer le dernier chiffre"><Delete size={21}/></button></div>
                <button className="primary validate" type="submit" disabled={!answer}><Check size={19}/> C'est ma réponse !</button>
              </>}
            </form>
            <div className={`feedback ${game.feedbackKind}`} role="status" aria-live="polite">{feedback || <><Heart size={14}/> Prends ton temps, tu peux réessayer.</>}</div>
            {!brush && <><button className="hint-button" aria-expanded={hint} onClick={()=>setHint(!hint)}><Lightbulb size={17}/>{hint?'Cacher le petit coup de pouce':'Un petit coup de pouce ?'}</button>{hint && <div className="hint"><p>Compte tous les points des deux groupes.</p><div className="dot-addition">{[question.a,question.b].map((n,i)=><React.Fragment key={i}>{i===1&&<b>+</b>}<div className={`dots dots-${i}`} aria-label={`${n} points`}>{n===0 ? <span>0</span> : Array.from({length:n},(_,j)=><i key={j}/>)}</div></React.Fragment>)}</div></div>}</>}
            <div className={`brush-status ${brush?'unlocked':''}`} style={brush?{'--paint':color.hex}:{}}>{brush?<Brush size={19}/>:<LockKeyhole size={17}/>}<span>{brush?`Pinceau ${question.sum} prêt à peindre`:'Ton pinceau attend la bonne réponse'}</span></div>
          </>}
        </aside>
      </div>
      <section className="palette-card"><div className="palette-title"><Palette size={19}/><div><h2>La palette des nombres</h2><p>À chaque nombre sa couleur</p></div></div><div className="swatches">{Object.entries(PALETTE).map(([n,c])=><span key={n} className={`swatch ${brush&&Number(n)===question.sum?'current':''}`} style={{'--paint':c.hex}} title={`${n} : ${c.name}`}>{n}</span>)}</div><LockKeyhole className="palette-lock" size={16}/></section>
    </> : view==='grotte' ? <>
      <section className="welcome cave-welcome"><div><div className="eyebrow"><Gem size={14}/> LES MERVEILLES D'ELISABETH</div><h1>La grotte au trésor des nombres<span>.</span></h1><p>Chaque peinture raconte toutes les additions que tu as réussies.</p></div><button className="secondary" onClick={()=>setView('atelier')}><ChevronLeft size={17}/> Retour à l'atelier</button></section>
      <section className="cave"><div className="cave-decor" aria-hidden="true"><span>✧</span><span>✦</span><span>✧</span><span>✦</span></div><div className="cave-heading"><span className="cave-icon"><Gem size={28}/></span><div><h2>Mes précieux tableaux</h2><p>{collection.items.length} trésor{collection.items.length>1?'s':''} dans ma collection</p></div></div>
      {collection.items.length===0 ? <div className="empty-cave"><div className="treasure-arch"><Gem size={62}/><Star size={22}/><Sparkles size={27}/></div><h3>Ton premier trésor t'attend</h3><p>Termine une peinture pour la déposer ici.<br/>Ta grotte se remplira de toutes tes couleurs !</p><button className="primary" onClick={()=>setView('atelier')}><Paintbrush size={18}/> Je retourne peindre <ArrowRight size={17}/></button></div> : <div className="treasure-gallery">{collection.items.map((treasure,i)=> {
        const drawing=ARTWORKS.find(a=>a.id===treasure.artworkId&&a.version===treasure.version);
        return <button key={treasure.id} className="treasure-card" onClick={()=>setModal({type:'treasure',treasure})}><div className="treasure-frame"><Painting art={drawing} colors={treasure.colors}/><span className="treasure-star"><Star size={16}/></span></div><div className="treasure-caption"><div><h3>{drawing.title}</h3><span>{new Date(treasure.completedAt).toLocaleDateString('fr-CH',{day:'numeric',month:'long',year:'numeric'})}</span></div><span className="treasure-number">N° {collection.items.length-i}</span></div></button>;
      })}</div>}</section><p className="storage-note"><LockKeyhole size={14}/> Tes trésors sont gardés dans ce navigateur, sur cet appareil.</p>
    </> : null}
    {collection.error && <div className="storage-warning" role="status">{collection.error}</div>}
    <footer><span><Heart size={14}/> Apprendre, créer, recommencer.</span><span>La danse des nombres <i>✦</i> Le petit monde d'Elisabeth</span></footer>
    </main>
    {modal && <Modal title={modal.type==='zoom'?art.title:ARTWORKS.find(a=>a.id===modal.treasure.artworkId).title} onClose={()=>setModal(null)}>{modal.type==='zoom' ? <><p className="modal-tip">{brush?`Colorie une seule zone ${question.sum}.`:'Résous l’addition dans l’atelier pour gagner ta couleur.'}</p><Painting art={art} colored={game.colored} phase={game.phase} sum={question?.sum} onPaint={id=>{const before=gamesRef.current[active];paint(id);if(gamesRef.current[active]!==before)setModal(null);}}/></> : <Painting art={ARTWORKS.find(a=>a.id===modal.treasure.artworkId)} colors={modal.treasure.colors}/>}</Modal>}
  </>;
}
