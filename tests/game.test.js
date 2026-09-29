import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, submitAnswer, paintZone } from '../src/game.js';

const drawing = { id: 'fixture', version: 1, zones: [{ id: 'a', number: 8 }, { id: 'b', number: 8 }, { id: 'c', number: 18 }] };
const start = () => createGame(drawing, () => 0);

test('painting is locked before a correct answer and after a wrong answer', () => {
  let game = start();
  assert.equal(game.phase, 'answer');
  game = paintZone(game, 'a', () => 0);
  assert.deepEqual(game.colored, []);
  game = submitAnswer(game, '7');
  assert.equal(game.phase, 'answer');
  assert.deepEqual(paintZone(game, 'a').colored, []);
});
test('one correct addition grants exactly one matching zone, even with repeated actions', () => {
  let game = submitAnswer(start(), '8');
  assert.equal(game.phase, 'paint');
  game = submitAnswer(game, '8');
  game = paintZone(game, 'c', () => 0);
  assert.equal(game.phase, 'paint');
  assert.deepEqual(game.colored, []);
  game = paintZone(game, 'a', () => 0);
  assert.deepEqual(game.colored, ['a']);
  assert.equal(game.phase, 'answer');
  assert.deepEqual(paintZone(game, 'b').colored, ['a']);
  game = submitAnswer(game, '8');
  assert.deepEqual(paintZone(game, 'a').colored, ['a']);
  assert.equal(paintZone(game, 'a').phase, 'paint');
  game = paintZone(game, 'b', () => 0);
  assert.deepEqual(game.colored, ['a', 'b']);
  assert.equal(game.question.a + game.question.b, 18);
});
test('empty and non-integer answers cannot unlock the brush', () => {
  for (const value of ['', ' ', '8.0', '-8', '8e0', '08', null, '19', '8x']) {
    assert.equal(submitAnswer(start(), value).phase, 'answer', String(value));
  }
});
test('a complete painting stops generating questions and cannot be changed', () => {
  let game = start();
  for (const [answer, id] of [['8','a'], ['8','b'], ['18','c']]) {
    game = paintZone(submitAnswer(game, answer), id, () => 0);
  }
  assert.equal(game.phase, 'complete');
  assert.equal(game.question, null);
  assert.equal(game.colored.length, 3);
  assert.deepEqual(submitAnswer(game, '18'), game);
  assert.deepEqual(paintZone(game, 'c'), game);
});
test('all sums from 1 through 18 use two addends from 0 through 9', () => {
  for (let n = 1; n <= 18; n++) {
    for (const rng of [() => 0, () => 0.5, () => 0.999999]) {
      const game = createGame({ id: 'n', version: 1, zones: [{ id: 'n', number: n }] }, rng);
      assert.equal(game.question.a + game.question.b, n);
      assert.ok(game.question.a >= 0 && game.question.a <= 9);
      assert.ok(game.question.b >= 0 && game.question.b <= 9);
    }
  }
});
test('a new session gets its own identity and starts with no colored zones', () => {
  const one = start(), two = start();
  assert.notEqual(one.id, two.id);
  assert.deepEqual(two.colored, []);
});
