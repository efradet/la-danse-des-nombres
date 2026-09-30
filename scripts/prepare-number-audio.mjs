import { mkdirSync,writeFileSync } from 'node:fs';
import { numberWords,numberAudioPath } from '../src/listening.js';
const clips=new Map();
for(const style of ['ch','ch80','fr'])for(let n=0;n<=100;n++){
  const file=numberAudioPath(n,style);
  if(!clips.has(file))clips.set(file,{file:`public${file}`,text:numberWords(n,style)});
}
mkdirSync('scripts',{recursive:true});
writeFileSync('scripts/number-audio-plan.json',JSON.stringify([...clips.values()],null,2)+'\n');
console.log(`${clips.size} recordings planned.`);
