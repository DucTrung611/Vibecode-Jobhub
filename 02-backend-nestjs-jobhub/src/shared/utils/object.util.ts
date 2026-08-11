/**
 * Assigns only the keys of `source` that are not `undefined` onto `target`.
 *
 * Plain `Object.assign(entity, dto)` is unsafe here: with `target: ES2023`
 * (tsconfig.json), TypeScript emits class fields using `useDefineForClassFields`
 * semantics, so an unset optional DTO field (e.g. `name?: string` never
 * provided in the request body) still exists as an own property with value
 * `undefined` on the DTO instance — `Object.assign` would then overwrite the
 * entity's existing value with `undefined` for every field the caller didn't
 * mean to touch.
 */
export function assignDefined<T extends object>(
  target: T,
  source: Partial<T>,
): T {
  for (const key of Object.keys(source) as Array<keyof T>) {
    const value = source[key];
    if (value !== undefined) {
      target[key] = value;
    }
  }
  return target;
}
