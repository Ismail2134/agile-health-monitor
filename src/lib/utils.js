export function serializeNonPOJOs(obj) {
  return structuredClone(obj);
}

export function getTrafficLightColor(score) {
  if (score === null || score === undefined) return '#e5e7eb';
  if (score <= 1.5) return '#22c55e';
  if (score <= 2.5) return '#f59e0b';
  return '#ef4444';
}

export function getTrafficLightLabel(score) {
  if (score === null || score === undefined) return 'Geen data';
  if (score <= 1.5) return 'Goed';
  if (score <= 2.5) return 'Matig';
  return 'Slecht';
}

export function getScoreLabel(value) {
  if (value === 1) return 'Goed';
  if (value === 2) return 'Matig';
  if (value === 3) return 'Slecht';
  return '-';
}

export function getScoreColor(value) {
  if (value === 1) return '#22c55e';
  if (value === 2) return '#f59e0b';
  if (value === 3) return '#ef4444';
  return '#e5e7eb';
}

export function calcAverage(scores) {
  if (!scores || scores.length === 0) return null;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 100) / 100;
}
