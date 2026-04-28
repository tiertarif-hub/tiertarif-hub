type SupabaseMockResponse<T> = {
  data: T;
  error: null | { message: string; code?: string };
};

export function createSupabaseSuccess<T>(data: T): SupabaseMockResponse<T> {
  return { data, error: null };
}

export function createSupabaseError(message: string, code = "TEST_ERROR"): SupabaseMockResponse<null> {
  return { data: null, error: { message, code } };
}
