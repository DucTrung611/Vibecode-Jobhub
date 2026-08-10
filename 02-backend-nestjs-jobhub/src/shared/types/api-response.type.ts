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

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details: Array<{ field: string; message: string }> | null;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}
