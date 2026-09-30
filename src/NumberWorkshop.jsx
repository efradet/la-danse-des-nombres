import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Delete, Ear, Gem, Heart, Headphones, RotateCcw, Settings2, Sparkles, Volume2 } from 'lucide-react';
import { ARTWORKS } from './artworks.js';
import { pickArtwork } from './variants.js';
import { LEVELS, DIALECTS, createListeningGame, hearQuestion, answerListening, advanceListening, numberAudioPath, recommendedLevel } from './listening.js';
import Painting from './Painting.jsx';
import { makeTreasure } from './treasures.js';
import './listening.css';

const SETTINGS_KEY='la-danse-des-nombres.listening-settings.v1';
function savedDialect(){try{const value=localStorage.getItem(SETTINGS_KEY);return DIALECTS[value]?value:'ch';}catch{return 'ch';}}

export default function NumberWorkshop({ mode, visible, treasures, onTreasure, onCave, reportRef }){
  const [active,setActive]=useState(ARTWORKS[0].id);
  const [levels,setLevels]=useState(()=>({recognize:recommendedLevel(treasures,'recognize'),write:recommendedLevel(treasures,'write')}));
  const [sessions,setSessions]=useState({}),sessionsRef=useRef(sessions);
  const [dialect,setDialect]=useState(savedDialect),[settings,setSettings]=useState(false),[settingsError,setSettingsError]=useState('');
  const [entry,setEntry]=useState(''),[audioState,setAudioState]=useState('idle'),[audioError,setAudioError]=useState('');
  const audioRef=useRef(null),audioGeneration=useRef(0),inputRef=useRef(null),nextActionRef=useRef(null),listenRef=useRef(null);
  const level=levels[mode],key=`${mode}:${active}:${level}`;
  const game=sessions[key],art=game?.artwork||ARTWORKS.find(a=>a.id===active);
  const currentKey=useRef(key),currentVisible=useRef(visible);
  currentKey.current=key;currentVisible.current=visible;
  const complete=game?.phase==='complete',correct=game?.phase==='correct';
  const saved=game&&treasures.some(t=>t.id===game.id);
  const recommended=recommendedLevel(treasures,mode);
  reportRef.current={activity:mode,drawing:art.title,levelMax:LEVELS[level],phase:game?.phase||'answer',
    questionNumber:game?game.index+1:1,heard:game?.heard||false,
    revealedParts:game?.colored.length||0,totalParts:art.zones.length};

  function storeGame(next,targetKey=key){
    const updated={...sessionsRef.current,[targetKey]:next};sessionsRef.current=updated;setSessions(updated);
  }
  function stopAudio(){
    audioGeneration.current++;
    if(audioRef.current){audioRef.current.pause();audioRef.current.onended=null;audioRef.current.onerror=null;audioRef.current=null;}
  }
  useEffect(()=>{
    if(!sessionsRef.current[key])storeGame(createListeningGame(pickArtwork(active),mode,level),key);
    setEntry('');setAudioError('');setAudioState('idle');
    return stopAudio;
  },[key,visible,dialect]);
  useEffect(()=>stopAudio,[]);
  useEffect(()=>{
    if(!visible)return;
    if(game?.phase==='correct'||game?.phase==='complete')nextActionRef.current?.focus();
    else listenRef.current?.focus();
  },[visible,key,game?.phase,game?.index]);

  function listen(slow=false){
    const current=sessionsRef.current[key];
    if(!visible||!current||current.phase!=='answer')return;
    stopAudio();setAudioError('');setAudioState('playing');
    const generation=audioGeneration.current,questionId=current.question.id,targetKey=key;
    const clip=new Audio(numberAudioPath(current.question.target,dialect));audioRef.current=clip;
    clip.playbackRate=slow?0.82:1;
    const stillCurrent=()=>generation===audioGeneration.current&&currentKey.current===targetKey&&currentVisible.current;
    const failed=()=>{if(stillCurrent()){setAudioState('idle');setAudioError('Le son n’a pas pu être lu. Vérifie le volume, puis appuie sur Réécouter.');}};
    clip.onended=()=>{
      if(!stillCurrent())return;
      setAudioState('idle');
      const latest=sessionsRef.current[targetKey];
      if(latest)storeGame(hearQuestion(latest,questionId),targetKey);
    };
    clip.onerror=failed;
    clip.play().catch(failed);
  }
  function submit(value){
    const current=sessionsRef.current[key];
    if(!current||audioState==='playing')return;
    const next=answerListening(current,value);
    if(next!==current){storeGame(next);if(next.phase==='correct'||next.phase==='complete')stopAudio();}
    if(next.feedbackKind==='try'){inputRef.current?.focus();inputRef.current?.select();}
  }
  function next(){storeGame(advanceListening(sessionsRef.current[key]));setEntry('');setAudioError('');}
  function restart(){stopAudio();storeGame(createListeningGame(pickArtwork(active,art.id),mode,level));setEntry('');setAudioError('');setAudioState('idle');}
  function changeDialect(value){
    stopAudio();setDialect(value);
    try{localStorage.setItem(SETTINGS_KEY,value);setSettingsError('');}catch{setSettingsError('Ce choix sera gardé seulement pendant cette visite.');}
  }
  function chooseLevel(value){setLevels(old=>({...old,[mode]:Number(value)}));}
  function digit(n){setEntry(old=>old.length>=3?String(n):old==='0'?String(n):old+n);}
  if(!game)return null;
  const blocked=!game.heard||audioState==='playing';
  return <section hidden={!visible} className="number-workshop" aria-label={mode==='recognize'?'J’écoute et je choisis':'J’écoute et j’écris'}>
    <section className="welcome"><div><div className="eyebrow"><Ear size={14}/> UN NOMBRE À LA FOIS</div><h1>{mode==='recognize'?'J’écoute et je choisis':'J’écoute et j’écris'}<span>.</span></h1><p>{mode==='recognize'?'Écoute le nombre et retrouve-le parmi les quatre cartes.':'Écoute le nombre et écris-le avec les touches.'} Chaque réussite révèle ton dessin.</p></div><span className="gentle-note"><Heart size={16}/> 8 petits défis, à ton rythme</span></section>
    <div className="level-strip"><span className="level-pill"><Sparkles size={16}/> Nombres de 0 à {LEVELS[level]}</span><span>Palier {level+1} sur {LEVELS.length}</span><button className="settings-link" onClick={()=>setSettings(!settings)} aria-expanded={settings}><Settings2 size={16}/> Réglages avec un adulte</button></div>
    {settings&&<section className="learning-settings" aria-label="Réglages des nombres"><label>Les nombres à travailler<select value={level} onChange={e=>chooseLevel(e.target.value)}>{LEVELS.map((max,i)=><option value={i} key={max}>De 0 à {max}{i===recommended?' · palier conseillé':''}</option>)}</select></label><label>Comment dit-on les nombres ?<select value={dialect} onChange={e=>changeDialect(e.target.value)}>{Object.entries(DIALECTS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><p>Le palier suivant est proposé après deux dessins avec au moins 6 réponses sur 8 trouvées du premier coup. Tu peux toujours rester ici ou choisir un autre palier.</p>{settingsError&&<p role="status">{settingsError}</p>}</section>}
    <section className="art-picker" aria-label="Choisis ton dessin sonore">{ARTWORKS.map(item=>{
      const session=sessions[`${mode}:${item.id}:${level}`];
      return <button key={item.id} onClick={()=>setActive(item.id)} className={`art-choice ${active===item.id?'active':''}`} aria-pressed={active===item.id}><span className={`art-thumb thumb-${item.id}`}><Painting art={session?.artwork||item} preview/></span><span>{item.title}<small>{session?.colored.length?`${session.phase==='complete'?8:session.index+(session.phase==='correct'?1:0)}/8 nombres` : '3 dessins surprises'}</small></span>{active===item.id&&<span className="choice-check"><Check size={12}/></span>}</button>;
    })}</section>
    <div className="play-layout listening-layout">
      <section className="canvas-card"><div className="canvas-header"><div><span className="eyebrow">MON DESSIN SE RÉVÈLE</span><h2>{art.title}<span className="art-subtitle">{art.subtitle}</span></h2></div><span className="reveal-count">{complete?8:game.index+(correct?1:0)} / 8</span></div><div className="canvas-paper listening-paper"><Painting art={art} colored={game.colored} reveal/><span className="paper-corner corner-left"/><span className="paper-corner corner-right"/>{complete&&<div className="finished-ribbon"><Sparkles size={17}/> Ton dessin est prêt !</div>}</div><div className="canvas-footer"><div className="progress-label"><span><Sparkles size={17}/>{complete?'Le dessin est terminé !':'Une bonne réponse fait apparaître une nouvelle partie.'}</span></div><div className="progress-track" role="progressbar" aria-label="Dessin révélé" aria-valuemin={0} aria-valuemax={8} aria-valuenow={complete?8:game.index+(correct?1:0)}><span style={{width:`${(complete?8:game.index+(correct?1:0))/8*100}%`}}/></div></div></section>
      <aside className="exercise-card listening-card" aria-label="Le nombre à écouter">
        {complete?<div className="completion"><div className="completion-gem"><Gem size={48}/><Sparkles size={26}/></div><span className="eyebrow">8 NOMBRES RÉUSSIS</span><h2>Bravo, Elisabeth !</h2><p>{saved?'Ton dessin est bien dans ta grotte.':'Ton dessin est terminé. Tu peux le déposer dans ta grotte !'}</p><button ref={nextActionRef} className="primary" onClick={()=>{if(!saved)onTreasure(makeTreasure(game));else onCave();}}><Gem size={18}/>{saved?'Voir ma grotte':'Mettre dans ma grotte'}</button>{saved&&recommended>level&&<button className="secondary" onClick={()=>chooseLevel(recommended)}>Essayer les nombres jusqu’à {LEVELS[recommended]} <ArrowRight size={17}/></button>}<button className="secondary" onClick={restart} disabled={!saved}><RotateCcw size={16}/> Rejouer à ce palier</button><p className="little-note">Tu peux refaire le même palier aussi souvent que tu veux.</p></div>:correct?<div className="listening-success"><span className="success-circle"><Check size={32}/></span><h2>Bien trouvé !</h2><strong className="found-number">{game.question.target}</strong><p>Une nouvelle partie de ton dessin est apparue.</p><button ref={nextActionRef} className="primary" onClick={next}>Le nombre suivant <ArrowRight size={18}/></button></div>:<>
          <div className="exercise-heading"><span className="step-badge"><Headphones size={18}/></span><div><h2>Écoute bien…</h2><p>Nombre {game.index+1} sur 8</p></div></div>
          <button ref={listenRef} className={`listen-button ${audioState==='playing'?'playing':''}`} onClick={()=>listen()}><Volume2 size={32}/><span>{audioState==='playing'?'J’écoute…':game.heard?'Réécouter le nombre':'Écouter le nombre'}</span></button>
          <button className="slow-listen" onClick={()=>listen(true)}><Ear size={15}/> Écouter plus lentement</button>
          {audioError&&<p className="audio-error" role="alert">{audioError}</p>}
          {mode==='recognize'?<div className="number-options" aria-label="Quatre nombres au choix">{game.question.options.map(n=><button key={n} disabled={blocked} onClick={()=>submit(String(n))}>{n}</button>)}</div>:<form className="number-entry-form" onSubmit={e=>{e.preventDefault();submit(entry);}}><label className="entry-label" htmlFor="heard-number">Le nombre que j’ai entendu</label><input id="heard-number" ref={inputRef} className="number-entry" aria-label="Le nombre entendu" inputMode="numeric" autoComplete="off" maxLength={3} value={entry} placeholder="?" disabled={blocked} onChange={e=>{if(/^\d{0,3}$/.test(e.target.value))setEntry(e.target.value);}}/><div className="keypad">{[1,2,3,4,5,6,7,8,9].map(n=><button type="button" key={n} disabled={blocked} onClick={()=>digit(n)}>{n}</button>)}<button type="button" disabled={blocked} onClick={()=>setEntry('')} className="clear-key" aria-label="Effacer le nombre">C</button><button type="button" disabled={blocked} onClick={()=>digit(0)}>0</button><button type="button" disabled={blocked} onClick={()=>setEntry(s=>s.slice(0,-1))} className="delete-key" aria-label="Effacer le dernier chiffre"><Delete size={20}/></button></div><button className="primary validate" type="submit" disabled={blocked||!entry}><Check size={19}/> Valider mon nombre</button></form>}
          <p className="listening-note"><Heart size={14}/> Tu peux réécouter et réessayer.</p>
        </>}
        <div className={`feedback ${game.feedbackKind}`} role="status" aria-live="polite" aria-atomic="true">{game.feedback}</div>
      </aside>
    </div>
  </section>;
}


