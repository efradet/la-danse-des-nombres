function nextQuestion(zones, colored, rng) {
  const remaining = zones.filter(zone => !colored.includes(zone.id));
  if (!remaining.length) return null;
  const number = remaining[Math.floor(rng() * remaining.length)].number;
  const min = Math.max(0, number - 9), max = Math.min(9, number);
  const a = min + Math.floor(rng() * (max - min + 1));
  return { a, b: number - a, sum: number };
}

export function createGame(artwork, rng = Math.random) {
  return { id: crypto.randomUUID(), artwork, colored: [], phase: 'answer',
    question: nextQuestion(artwork.zones, [], rng), feedback: '', feedbackKind: 'neutral' };
}

export function submitAnswer(state, text) {
  if (state.phase !== 'answer') return state;
  if (typeof text !== 'string' || !/^(?:[0-9]|1[0-8])$/.test(text)) {
    return { ...state, feedback: 'Écris un nombre entre 0 et 18.', feedbackKind: 'try' };
  }
  if (Number(text) !== state.question.sum) {
    return { ...state, feedback: 'Essaie encore, tu vas trouver !', feedbackKind: 'try' };
  }
  return { ...state, phase: 'paint', feedback: `Bravo ! Colorie une zone ${state.question.sum}.`, feedbackKind: 'success' };
}

export function paintZone(state, zoneId, rng = Math.random) {
  if (state.phase !== 'paint') return state;
  const zone = state.artwork.zones.find(item => item.id === zoneId);
  if (!zone || state.colored.includes(zoneId) || zone.number !== state.question.sum) return state;
  const colored = [...state.colored, zoneId];
  const question = nextQuestion(state.artwork.zones, colored, rng);
  return { ...state, colored, question, phase: question ? 'answer' : 'complete',
    feedback: question ? 'Une jolie touche de couleur ! À toi de calculer.' : 'Ta peinture est terminée !',
    feedbackKind: question ? 'neutral' : 'success' };
}
