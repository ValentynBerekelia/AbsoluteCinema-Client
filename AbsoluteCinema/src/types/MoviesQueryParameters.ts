export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export interface MoviesQueryParameters {
  searchTerm?: string;
  genres?: string[];
  pageNumber?: number;
  pageSize?: number;
  sortColumn?: string;
  sortOrder?: SortOrder;
}

export const defaultMoviesQueryParams: MoviesQueryParameters = {
  pageNumber: 1,
  pageSize: 10,
  sortColumn: 'name',
  sortOrder: SortOrder.Asc
};
