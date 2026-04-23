export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
