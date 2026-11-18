// Checks the daily puzzle generator: run with `node test/engine.test.js`.
// It pulls the engine straight out of index.html so there is one source of truth.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const src = html.split('/*ENGINE-START*/')[1].split('/*ENGINE-END*/')[0];
const Engine = new Function(src + '; return Engine;')();

const DAYS = Number(process.argv[2] || 730);
const start = Date.UTC(2026, 10, 18);
const stats = [0, 1, 2].map(() => ({ n: 0, clues: 0, min: 81, max: 0, tier2: 0 }));
let slowest = 0;

for (let d = 0; d < DAYS; d++) {
  const key = new Date(start + d * 864e5).toISOString().slice(0, 10);
  const t0 = process.hrtime.bigint();
  const g = Engine.generate(key);
  slowest = Math.max(slowest, Number(process.hrtime.bigint() - t0) / 1e6);

  // The solution is a valid, complete grid.
  for (const unit of Engine.UNITS) {
    assert.strictEqual(new Set(unit.map(i => g.solution[i])).size, 9, key + ': bad solution');
  }
  // Clues agree with the solution and the puzzle has exactly one answer.
  g.puzzle.forEach((v, i) => assert.ok(v === 0 || v === g.solution[i], key + ': clue mismatch'));
  assert.strictEqual(Engine.countSolutions(g.puzzle, 2), 1, key + ': not unique');
  // It is solvable by logic alone at the day's level, with no guessing.
  const tier = Engine.LEVELS[g.level].tier;
  const solved = Engine.logicSolve(g.puzzle, tier);
  assert.ok(solved.solved, key + ': needs guessing');
  // Mirror symmetry.
  g.puzzle.forEach((v, i) => assert.strictEqual(!!v, !!g.puzzle[80 - i], key + ': not symmetric'));
  // Same date, same puzzle.
  assert.deepStrictEqual(Engine.generate(key).puzzle, g.puzzle, key + ': not deterministic');

  const s = stats[g.level];
  const clues = g.puzzle.filter(Boolean).length;
  assert.strictEqual(clues, g.clues);
  s.n++; s.clues += clues; s.min = Math.min(s.min, clues); s.max = Math.max(s.max, clues);
  if (!Engine.logicSolve(g.puzzle, 1).solved) s.tier2++;
}

// Pinned puzzle: if this changes, every player's daily puzzle changed too.
const PINNED = process.env.PRINT_PIN ? null : fs.readFileSync(path.join(__dirname, 'pinned.txt'), 'utf8').trim();
const first = Engine.generate('2026-11-18').puzzle.join('');
if (PINNED === null) console.log(first);
else assert.strictEqual(first, PINNED, 'the 2026-11-18 puzzle changed');

stats.forEach((s, i) => {
  console.log(`${Engine.LEVELS[i].name.padEnd(8)} ${String(s.n).padStart(4)} days  clues avg ${(s.clues / s.n).toFixed(1)} (min ${s.min}, max ${s.max})  needs advanced steps: ${s.tier2}`);
});
console.log(`slowest generation: ${slowest.toFixed(1)} ms`);
console.log(`ok: ${DAYS} days checked`);
