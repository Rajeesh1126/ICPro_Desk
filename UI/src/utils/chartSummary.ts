/** One-sentence summary for a chart's accessible name. */
export function summariseSeries(entries: { name: string; value: number }[], unit = "") {
  const total = entries.reduce((sum, entry) => sum + entry.value, 0);
  const parts = [...entries]
    .sort((a, b) => b.value - a.value)
    .map((entry) => `${entry.name} ${entry.value}${unit}`);
  return `Total ${total}${unit}. ${parts.join(", ")}.`;
}
