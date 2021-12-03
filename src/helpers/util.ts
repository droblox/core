/*
 * Array range
 */
export function arrayRange(start: number, stop: number, step = 1): number[] {
  const result: number[] = [];
  if (stop === undefined) {
    stop = start;
    start = 0;
  }
  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
    return [];
  }
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
    result.push(i);
  }
  return result;
}
