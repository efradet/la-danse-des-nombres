import test from 'node:test';
import assert from 'node:assert/strict';
import {ARTWORKS} from '../src/artworks.js';
import {ALL_ARTWORKS,pickArtwork} from '../src/variants.js';
import {createGame,submitAnswer,paintZone} from '../src/game.js';
import {createListeningGame,hearQuestion,answerListening,advanceListening} from '../src/listening.js';
import {makeTreasure,saveTreasure,loadTreasures} from '../src/treasures.js';
test('each theme has three genuinely different drawings and old identities stay available',()=>{
  assert.equal(ALL_ARTWORKS.length,15);
  assert.equal(new Set(ALL_ARTWORKS.map(a=>a.id)).size,15);
  for(const base of ARTWORKS){
    assert.equal(ALL_ARTWORKS.find(a=>a.id===base.id&&a.version===base.version),base);
    const family=ALL_ARTWORKS.filter(a=>(a.themeId||a.id)===base.id);
    assert.equal(family.length,3);
    assert.equal(new Set(family.map(a=>a.zones.map(z=>z.d).join('|'))).size,3);
  }
});
test('random selection spans each family and never immediately repeats the previous drawing',()=>{
  for(const base of ARTWORKS){
    const ids=[0,.4,.9999].map(n=>pickArtwork(base.id,null,()=>n).id);
    assert.equal(new Set(ids).size,3);
    for(const previous of ids)for(const n of [0,.5,.9999]){
      const next=pickArtwork(base.id,previous,()=>n);
      assert.notEqual(next.id,previous);assert.equal(next.themeId||next.id,base.id);
    }
  }
});
test('all variants finish in both game engines and restore their exact saved drawing',()=>{
  for(const art of ALL_ARTWORKS){
    assert.equal(new Set(art.zones.map(z=>z.id)).size,art.zones.length);
    assert.ok(art.zones.every(z=>Number.isInteger(z.number)&&z.number>=1&&z.number<=18));
    let game=createGame(art,()=>0);
    while(game.phase!=='complete'){
      const target=art.zones.find(z=>z.number===game.question.sum&&!game.colored.includes(z.id));
      game=paintZone(submitAnswer(game,String(game.question.sum)),target.id,()=>0);
    }
    const treasure=makeTreasure(game);let raw=null;
    const storage={getItem:()=>raw,setItem:(_k,value)=>{raw=value;}};
    saveTreasure([],treasure,storage);
    assert.deepEqual(loadTreasures(storage,ALL_ARTWORKS).items,[treasure]);
    assert.equal(ALL_ARTWORKS.find(a=>a.id===treasure.artworkId&&a.version===treasure.version),art);
    let listening=createListeningGame(art,'recognize',0,()=>.2);
    for(let i=0;i<8;i++){
      listening=answerListening(hearQuestion(listening,listening.question.id),String(listening.question.target));
      if(i<7)listening=advanceListening(listening);
    }
    assert.equal(listening.phase,'complete');assert.equal(listening.colored.length,art.zones.length);
  }
});
