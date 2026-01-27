import axios from "axios";
import { http } from "../http";
import type { MovieUpdateRequest } from "../types/updateFullMovie";
import type { ErrorResponse } from "../types/common";
export class ApiError extends Error {
  status?: number;
  data?: ErrorResponse;

  constructor(message: string, status?: number, data?: ErrorResponse) {
    super(message);
    this.status = status;
    this.data = data;
  }
}
export const adminMoviesApi = {
  /**
   * PUT /admin/movies/{movieId}
   * 204 -> void
   * 400/404/500 -> ErrorResponse
   */
  
  updateFull: async (movieId: string, payload: MovieUpdateRequest): Promise<void> => {
    try {
        await http.put<void>(`/admin/movies/${movieId}`, payload);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const data = error.response?.data as ErrorResponse | undefined;
            throw new ApiError(data?.message || "API Error", status, data);
        }
        throw error;
    }
    },
};