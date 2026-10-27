const timeOf = (value?: string) => {
  const time = value ? new Date(value).getTime() : Number.NaN;
  return Number.isNaN(time) ? null : time;
};

/** Chat order: oldest at the top, latest at the bottom (entries without a valid date keep their place). */
export function oldestFirst<T extends { created_at?: string }>(items?: T[] | null): T[] {
  return (items ?? [])
    .map((item, index) => ({ item, index, time: timeOf(item.created_at) }))
    .sort((a, b) =>
      a.time !== null && b.time !== null && a.time !== b.time
        ? a.time - b.time
        : a.index - b.index,
    )
    .map(({ item }) => item);
}
