/** How many filters differ from their defaults (for the "Filters · 2" button). */
export function countChangedFilters<T extends object>(current: T, defaults: T) {
  return (Object.keys(defaults) as (keyof T)[]).filter(
    (key) => String(current[key] ?? "") !== String(defaults[key] ?? ""),
  ).length;
}
