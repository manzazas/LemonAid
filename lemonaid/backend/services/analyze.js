// Placeholder analyzer: return a minimal shape with a random score.
// We'll replace this with real analysis logic later.

export default function analyze(/* raw */) {
  const score = Math.floor(Math.random() * 101); // 0..100
  return {
    listings: [],
    count: 0,
    score,
    note: 'placeholder analysis — random score'
  };
}
