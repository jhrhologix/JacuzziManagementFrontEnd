export interface JsonModel<T> {
  accessToken: string;
  refreshToken: string;
  expires_in: number;
  data: T;
  Message: string;
  StatusCode: number;
  AppError: string;
  Meta?: {
    TotalPages: number;
    PageSize: number;
    CurrentPage: number;
    DefaultPageSize: number;
    TotalRecords: number;
  };
} 