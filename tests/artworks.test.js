import test from 'node:test';
import assert from 'node:assert/strict';
import { ARTWORKS } from '../src/artworks.js';
import { createGame, submitAnswer, paintZone } from '../src/game.js';
import { makeTreasure, loadTreasures, saveTreasure } from '../src/treasures.js';

test('all five requested paintings can be completed and restored with their colors', () => {
  assert.deepEqual(ARTWORKS.map(a=>a.id), ['sirene','licorne','chateau','princesse','dragon']);
  for (const art of ARTWORKS) {
    assert.equal(new Set(art.zones.map(z=>z.id)).size, art.zones.length);
    for (const seed of [0, .35, .9999]) {
      let game = createGame(art, () => seed), steps = 0;
      while (game.phase !== 'complete') {
        const sum = game.question.a + game.question.b;
        assert.ok(sum >= 1 && sum <= 18);
        const target = art.zones.find(z=>z.number===sum && !game.colored.includes(z.id));
        assert.ok(target);
        assert.ok(target.d.endsWith('Z') || target.d.startsWith('M '));
        game = paintZone(submitAnswer(game, String(sum)), target.id, () => seed);
        assert.ok(++steps <= art.zones.length);
      }
      assert.equal(steps, art.zones.length);
      let raw = null;
      const storage = { getItem:()=>raw, setItem:(_key,data)=> { raw=data; } };
      const treasure = makeTreasure(game);
      saveTreasure([], treasure, storage);
      assert.deepEqual(loadTreasures(storage, ARTWORKS).items, [treasure]);
    }
  }
});
