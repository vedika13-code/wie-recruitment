import "server-only";

// Server Actions have no real HTTP status code the way the old Express routes did
// (409/423/403 caught by a trailing error-handler middleware) — every action instead
// returns this typed shape, and Client Components branch on `code`. The underlying
// business logic/thrown-error sites (CycleError, AuthError) are unchanged; only the
// transport of the result differs from real HTTP semantics.
export type ActionErrorCode = 400 | 401 | 403 | 404 | 409 | 423;

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ActionErrorCode; message: string };

export function actionOk<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function actionErr(code: ActionErrorCode, message: string): ActionResult<never> {
  return { ok: false, code, message };
}

// Converts a thrown error (CycleError/AuthError, both carrying `.status`, or anything
// else) into the typed failure shape, so every action's catch block stays a one-liner.
export function actionErrFromCaught(err: unknown): ActionResult<never> {
  if (err instanceof Error && "status" in err && typeof err.status === "number") {
    const status = err.status;
    if (status === 400 || status === 401 || status === 403 || status === 404 || status === 409 || status === 423) {
      return { ok: false, code: status, message: err.message };
    }
  }
  return { ok: false, code: 400, message: err instanceof Error ? err.message : "Unexpected error" };
}
