export const LEVELS = [19,29,49,69,100];
export const DIALECTS = { ch:'Septante, huitante, nonante', ch80:'Septante, quatre-vingts, nonante', fr:'Soixante-dix, quatre-vingts, quatre-vingt-dix' };
export function recommendedLevel(treasures,mode){
  for(let level=0;level<LEVELS.length-1;level++){
    const ids=new Set(treasures.filter(t=>t.activity===mode&&t.level===level&&t.totalQuestions===8&&Number.isInteger(t.firstTry)&&t.firstTry>=6&&t.firstTry<=8).map(t=>t.id));
    if(ids.size<2)return level;
  }
  return LEVELS.length-1;
}
function shuffle(values,rng){
  const copy=[...values];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy;
}
export function createListeningGame(artwork,mode,level=0,rng=Math.random){
  if(!['recognize','write'].includes(mode)||!Number.isInteger(level)||!LEVELS[level])throw new Error('Invalid activity or level');
  const max=LEVELS[level], pool=Array.from({length:max+1},(_,n)=>n);
  const newer=level ? shuffle(pool.filter(n=>n>LEVELS[level-1]),rng).slice(0,4) : [];
  const targets=shuffle([...newer,...shuffle(pool.filter(n=>!newer.includes(n)),rng).slice(0,8-newer.length)],rng);
  const id=crypto.randomUUID();
  const questions=targets.map((target,i)=>{
    const reversed=Number(String(target).split('').reverse().join(''));
    const distractors=[reversed,target-1,target+1,target-10,target+10,...shuffle(pool,rng)];
    const others=[...new Set(distractors)].filter(n=>n!==target&&n>=0&&n<=max).slice(0,3);
    return {id:`${id}:${i}`,target,options:shuffle([target,...others],rng)};
  });
  return {id,artwork,mode,level,questions,question:questions[0],index:0,phase:'answer',heard:false,
    colored:[],firstTry:0,missed:false,feedback:'Écoute le nombre, puis réponds.',feedbackKind:'neutral'};
}
export function hearQuestion(game,id){
  if(game.phase!=='answer'||game.question.id!==id)return game;
  return {...game,heard:true};
}
export function answerListening(game,text){
  if(game.phase!=='answer'||!game.heard)return game;
  if(typeof text!=='string'||!/^(?:0|[1-9]\d?|100)$/.test(text))return {...game,missed:game.missed||(typeof text==='string'&&text.length>0),feedback:'Écris un nombre de 0 à 100.',feedbackKind:'try'};
  if(Number(text)!==game.question.target)return {...game,missed:true,feedback:'Ce n’est pas encore ce nombre. Réécoute et essaie à nouveau.',feedbackKind:'try'};
  const count=Math.ceil((game.index+1)*game.artwork.zones.length/game.questions.length);
  return {...game,colored:game.artwork.zones.slice(0,count).map(z=>z.id),firstTry:game.firstTry+(game.missed?0:1),
    phase:game.index===game.questions.length-1?'complete':'correct',feedback:`Bravo, c’est ${game.question.target} !`,feedbackKind:'success'};
}
export function advanceListening(game){
  if(game.phase!=='correct')return game;
  const index=game.index+1;
  return {...game,index,question:game.questions[index],phase:'answer',heard:false,missed:false,feedback:'Écoute le nombre, puis réponds.',feedbackKind:'neutral'};
}
const small=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize'];
export function numberWords(n,style='ch'){
  if(!Number.isInteger(n)||n<0||n>100||!DIALECTS[style])throw new Error('Invalid number or dialect');
  if(n<=16)return small[n];
  if(n<20)return `dix-${small[n-10]}`;
  if(n===100)return 'cent';
  if(style==='fr'&&n>=70&&n<80)return n===71?'soixante et onze':`soixante-${numberWords(n-60,style)}`;
  if((style==='fr'&&n>=80)||(style==='ch80'&&n>=80&&n<90))return n===80?'quatre-vingts':`quatre-vingt-${numberWords(n-80,style)}`;
  const tens=['','','vingt','trente','quarante','cinquante','soixante','septante','huitante','nonante'];
  const base=tens[Math.floor(n/10)],unit=n%10;
  return base+(unit===0?'':unit===1?' et un':`-${small[unit]}`);
}
export function numberAudioPath(n,style='ch'){
  numberWords(n,style);
  return `/audio/numbers/${n<70||n===100?'common':style}/${n}.mp3`;
}
