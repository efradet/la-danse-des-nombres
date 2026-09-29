import test from 'node:test';
import assert from 'node:assert/strict';
import { makeTreasure, loadTreasures, saveTreasure } from '../src/treasures.js';
import { createGame, submitAnswer, paintZone } from '../src/game.js';

const drawing = { id: 'fixture', version: 1, title: 'Test', zones: [{ id: 'a', number: 8 }] };
const catalog = [drawing];
const complete = () => paintZone(submitAnswer(createGame(drawing, () => 0), '8'), 'a');
function memory() { let value = null; return { getItem: () => value, setItem: (_key, data) => { value = data; } }; }

test('unfinished paintings cannot become treasures', () => {
  assert.equal(makeTreasure(createGame(drawing)), null);
});
test('finished painting retains identity, version and original colors after reload', () => {
  const storage = memory();
  const treasure = makeTreasure(complete());
  assert.equal(treasure.artworkId, 'fixture');
  assert.equal(treasure.version, 1);
  assert.match(treasure.colors.a, /^#[0-9a-f]{6}$/i);
  const saved = saveTreasure([], treasure, storage);
  assert.equal(saved.error, null);
  assert.deepEqual(loadTreasures(storage, catalog).items, [treasure]);
});
test('one finish is saved once; another session earns another treasure', () => {
  const storage = memory(), treasure = makeTreasure(complete());
  let saved = saveTreasure([], treasure, storage);
  saved = saveTreasure(saved.items, treasure, storage);
  assert.equal(saved.items.length, 1);
  saved = saveTreasure(saved.items, makeTreasure(complete()), storage);
  assert.equal(saved.items.length, 2);
});
test('blocked or full storage keeps the earned painting in memory with a warning', () => {
  const storage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('full'); } };
  assert.deepEqual(loadTreasures(storage, catalog).items, []);
  assert.ok(loadTreasures(storage, catalog).error);
  const saved = saveTreasure([], makeTreasure(complete()), storage);
  assert.equal(saved.items.length, 1);
  assert.ok(saved.error);
});
test('corrupt and incomplete stored entries are ignored safely', () => {
  for (const raw of ['{', 'null', '{}', '"text"', '[null]', '[{"id":"bad"}]']) {
    const result = loadTreasures({ getItem: () => raw }, catalog);
    assert.deepEqual(result.items, []);
    assert.ok(result.error);
  }
  const treasure = makeTreasure(complete());
  const raw = JSON.stringify([treasure, {...treasure, id:'bad', colors:{a:'url(https://invalid)'}}, treasure]);
  const result = loadTreasures({ getItem: () => raw }, catalog);
  assert.equal(result.items.length, 1);
  assert.ok(result.error);
});
