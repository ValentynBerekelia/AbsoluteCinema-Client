// API Schema Types based on OpenAPI specification

export enum MediaType {
  Poster = 1,
  Banner = 2,
  Still = 3,
  Trailer = 4
}

export enum MovieFormat {
  Standard = 1,
  IMAX = 2
}

export enum SortOrder {
  Ascending = 1,
  Descending = 2
}

export interface MovieCreateRequest {
  movieName: string;
  description?: string;
  rate: number;
  ageLimit: number;
  duration: TimeSpan;
  country?: string;
  studio?: string;
  language?: string;
  genres?: string[];
}

export interface MovieUpdateRequest {
  name: string;
  description?: string;
  rate: number;
  ageLimit: number;
  durationSecond: number;
  country?: string;
  studio?: string;
  language?: string;
}

export interface MovieUpdatePartialRequest {
  name?: string;
  description?: string;
  rate?: number;
  ageLimit?: number;
  durationSeconds?: number;
  country?: string;
  studio?: string;
  language?: string;
}

export interface TimeSpan {
  ticks: number;
}

export interface AttachMediaRequest {
  mediaId: string;
}

export interface CreateMediaRequest {
  url: string;
  type: MediaType;
}

export interface CreateAndAttachMediaResponse {
  movieId: string;
}

export interface SessionPriceDto {
  seatTypeId: string;
  price: number;
}

export interface CreateSessionCommand {
  movieId: string;
  hallId: string;
  format: MovieFormat;
  startTime: string; // ISO datetime
  prices?: SessionPriceDto[];
}

export interface SessionUpdateFullRequest {
  movieId: { id: string };
  hallId: { id: string };
  format: MovieFormat;
  startDateTime: string; // ISO datetime
}

export interface SessionUpdatePartialRequest {
  movieID?: { id: string };
  hallId?: { id: string };
  format?: MovieFormat;
  startDateTime?: string; // ISO datetime
}

export interface MoviesQueryParams {
  SearchTerm?: string;
  Genres?: string[];
  PageNumber?: number;
  PageSize?: number;
  SortColumn?: string;
  SortOrder?: SortOrder;
}

export interface SessionsQueryParams {
  pageNumber?: number;
  pageSize?: number;
  sortColumn?: string;
  sortOrder?: string;
}
