// A Result makes expected failures part of a function's return type instead
// of a thrown exception, so use cases can hand errors back to the UI layer
// as data (e.g. to render a form error) without try/catch at every call site.
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
