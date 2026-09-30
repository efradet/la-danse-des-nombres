import test from 'node:test';
import assert from 'node:assert/strict';
import { ARTWORKS } from '../src/artworks.js';
import { createListeningGame, hearQuestion, answerListening, advanceListening, numberWords, numberAudioPath, LEVELS, recommendedLevel } from '../src/listening.js';
import { makeTreasure } from '../src/treasures.js';
const start = (mode='recognize', level=0) => createListeningGame(ARTWORKS[0],mode,level,()=>0.3);
const heard = game => hearQuestion(game, game.question.id);
const correct = game => answerListening(heard(game),String(game.question.target));

test('each level produces eight distinct targets and four unique choices in range',()=>{
  for(let level=0;level<LEVELS.length;level++){
    const game=start('recognize',level);
    assert.equal(game.questions.length,8);
    assert.equal(new Set(game.questions.map(q=>q.target)).size,8);
    for(const q of game.questions){
      assert.equal(q.options.length,4); assert.equal(new Set(q.options).size,4);
      assert.ok(q.options.includes(q.target));
      assert.ok(q.options.every(n=>Number.isInteger(n)&&n>=0&&n<=LEVELS[level]));
    }
    if(level) assert.ok(game.questions.filter(q=>q.target>LEVELS[level-1]).length>=4);
  }
});
test('no reveal before listening, after an error, or after a repeated correct answer',()=>{
  let game=start();
  assert.equal(answerListening(game,String(game.question.target)),game);
  assert.equal(hearQuestion(game,'stale-question'),game);
  game=heard(game);
  const wrong=game.question.options.find(n=>n!==game.question.target);
  game=answerListening(game,String(wrong));
  assert.equal(game.phase,'answer');assert.equal(game.colored.length,0);
  game=answerListening(game,String(game.question.target));
  assert.equal(game.phase,'correct');assert.ok(game.colored.length>0);
  assert.equal(game.firstTry,0);
  assert.equal(answerListening(game,String(game.question.target)),game);
  game=advanceListening(game);
  assert.equal(game.heard,false); assert.equal(game.index,1);
});
test('eight successful answers finish the entire drawing and create a compatible treasure',()=>{
  for(const mode of ['recognize','write']){
    let game=start(mode);
    for(let i=0;i<8;i++){
      game=correct(game);
      assert.equal(game.colored.length,Math.ceil((i+1)*game.artwork.zones.length/8));
      if(i<7)game=advanceListening(game);
    }
    assert.equal(game.phase,'complete');assert.equal(game.firstTry,8);
    assert.equal(makeTreasure(game).artworkId,'sirene');
    assert.equal(advanceListening(game),game);
  }
});
test('writing rejects malformed input and accepts zero and 100 as numbers',()=>{
  let game=heard(start('write',4));
  for(const value of ['', ' ', '-1', '1.0', '1e2','001','1000',null]) {
    assert.equal(answerListening(game,value).phase,'answer');
    assert.equal(answerListening(game,value).colored.length,0);
  }
  for(const target of [0,100]){
    const boundary={...game,question:{...game.question,target}};
    assert.equal(answerListening(boundary,String(target)).phase,'correct');
  }
});
test('French and Swiss number names are explicit and consistent through 100',()=>{
  for(const [n,style,want] of [[0,'ch','zéro'],[16,'ch','seize'],[21,'ch','vingt et un'],[71,'ch','septante et un'],[80,'ch','huitante'],[81,'ch','huitante et un'],[99,'ch','nonante-neuf'],[80,'ch80','quatre-vingts'],[81,'ch80','quatre-vingt-un'],[91,'ch80','nonante et un'],[70,'fr','soixante-dix'],[71,'fr','soixante et onze'],[80,'fr','quatre-vingts'],[91,'fr','quatre-vingt-onze'],[100,'fr','cent']]){
    assert.equal(numberWords(n,style),want);
  }
  for(let n=0;n<=100;n++)for(const style of ['ch','ch80','fr'])assert.ok(numberWords(n,style).length>0);
  assert.throws(()=>numberWords(101));assert.throws(()=>numberWords(-1));
  assert.equal(numberAudioPath(19,'ch'),numberAudioPath(19,'fr'));
  assert.notEqual(numberAudioPath(80,'ch'),numberAudioPath(80,'fr'));
});
test('progression is independent for each activity and needs two strong unique paintings per level',()=>{
  const one={id:'one',activity:'recognize',level:0,firstTry:6,totalQuestions:8};
  assert.equal(recommendedLevel([one,one],'recognize'),0);
  const two={...one,id:'two'};
  assert.equal(recommendedLevel([one,two],'recognize'),1);
  assert.equal(recommendedLevel([one,two],'write'),0);
  assert.equal(recommendedLevel([one,{...two,firstTry:5}],'recognize'),0);
  assert.equal(recommendedLevel([{...one,level:3},{...two,level:3}],'recognize'),0);
  const all=Array.from({length:10},(_,i)=>({...one,id:`t${i}`,level:Math.floor(i/2)}));
  assert.equal(recommendedLevel(all,'recognize'),4);
});
test('listening trophies retain activity and first-try score for progression after reload',()=>{
  let game=start('write',1);
  for(let i=0;i<8;i++){game=correct(game);if(i<7)game=advanceListening(game);}
  const treasure=makeTreasure(game);
  assert.equal(treasure.activity,'write');assert.equal(treasure.level,1);
  assert.equal(treasure.firstTry,8);assert.equal(treasure.totalQuestions,8);
});
test('an out-of-range submitted number cannot count as a first-try success',()=>{
  let game=heard(start('write'));
  game=answerListening(game,'101');
  game=answerListening(game,String(game.question.target));
  assert.equal(game.firstTry,0);
});
