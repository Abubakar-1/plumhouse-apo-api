// src/types/api.types.ts

// Using a generic <T> allows us to strongly type the `data` payload.
// For example, IApiResponse<Room> or IApiResponse<Room[]>.
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error?: {
    code?: string;
    details?: any;
  } | null;
}
