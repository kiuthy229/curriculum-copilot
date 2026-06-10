import frameworks from "../data/frameworks.json";
import suggestions from "../data/suggestions.json";

export function detectDrift(text: string) {
  const lower = text.toLowerCase();

  // simple presence check for known concepts
  const present: string[] = [];
  const missingFromFrameworks: string[] = [];

  for (const concept of (frameworks as any).current) {
    if (lower.includes((concept as string).toLowerCase())) present.push(concept);
  }

  for (const emerg of (frameworks as any).emerging) {
    if (!lower.includes((emerg as string).toLowerCase())) missingFromFrameworks.push(emerg);
  }

  // naive freshness score: percent of emerging topics present
  const emergingFound = (frameworks as any).emerging.filter((e: any) => lower.includes(String(e).toLowerCase())).length;
  const freshness = Math.round((emergingFound / Math.max(1, frameworks.emerging.length)) * 100);

  return {
    present,
    missingEmerging: missingFromFrameworks,
    suggestions: missingFromFrameworks.map((m) => ({ topic: m, suggestion: (suggestions as any)[m] || null })),
    freshness,
    // human-readable review text
    textReport: generateTextReport({ present, missing: missingFromFrameworks, suggestions: missingFromFrameworks.map((m) => ({ topic: m, suggestion: (suggestions as any)[m] || null })), freshness })
  };
}

function generateTextReport(data: { present: string[]; missing: string[]; suggestions: { topic: string; suggestion: string | null }[]; freshness: number }) {
  const lines: string[] = [];
  lines.push(`Curriculum freshness: ${data.freshness}%`);

  if (data.present.length) {
    lines.push(`Detected topics present in the uploaded material: ${data.present.slice(0, 10).join(', ')}.`);
  } else {
    lines.push('No core topics from the baseline list were detected in the material.');
  }

  if (data.missing.length) {
    lines.push(`Emerging topics not found (potential drift): ${data.missing.join(', ')}.`);
    lines.push('Suggested updates you can consider:');
    for (const s of data.suggestions) {
      lines.push(`- ${s.topic}: ${s.suggestion ?? 'Add coverage for this topic.'}`);
    }
  } else {
    lines.push('No missing emerging topics detected. Curriculum appears up-to-date for the tracked emerging concepts.');
  }

  lines.push('Quick actions:');
  lines.push('- Add a short module or lecture covering the highest-priority missing topic.');
  lines.push('- Update reading list with 1–2 modern references (papers, blog posts, vendor docs).');
  lines.push('- Add one assessment that requires practical application of the new concept.');

  return lines.join('\n\n');
}
