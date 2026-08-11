export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details: Array<{ field: string; message: string }> | null;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiError extends Error {
  readonly code: string;
  readonly details: Array<{ field: string; message: string }> | null;
  readonly httpStatus: number;

  constructor(payload: ApiErrorPayload, httpStatus: number) {
    super(payload.message);
    this.name = "ApiError";
    this.code = payload.code;
    this.details = payload.details;
    this.httpStatus = httpStatus;
  }
}
