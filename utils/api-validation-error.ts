/** Error shape produced by `lib/axios` (`handleError`). */
export interface ApiError {
  message: string;
  code?: number;
  data?: unknown;
}

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' && value !== null && typeof (value as ApiError).message === 'string'
  );
}

/**
 * Pulls per-field messages out of a backend validation response:
 * `{ errors: { email: ["invalid"] } }`, `{ errors: { email: "invalid" } }`
 * or `{ errors: [{ field: "email", message: "invalid" }] }`. First message per field wins.
 */
export function getFieldErrors<T extends string = string>(error: unknown): FieldErrors<T> {
  const result: Record<string, string> = {};
  if (!isApiError(error)) return result as FieldErrors<T>;

  const errors = (error.data as { errors?: unknown } | undefined)?.errors;

  if (Array.isArray(errors)) {
    for (const item of errors) {
      const { field, message } = (item ?? {}) as { field?: unknown; message?: unknown };
      if (typeof field === 'string' && typeof message === 'string' && !(field in result)) {
        result[field] = message;
      }
    }
  } else if (errors && typeof errors === 'object') {
    for (const [field, value] of Object.entries(errors)) {
      const message = Array.isArray(value) ? value[0] : value;
      if (typeof message === 'string') result[field] = message;
    }
  }

  return result as FieldErrors<T>;
}

export function isValidationError(error: unknown): boolean {
  return isApiError(error) && (error.code === 400 || error.code === 422);
}
