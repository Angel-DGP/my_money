export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    has_more?: boolean;
    [key: string]: any;
  };
}
