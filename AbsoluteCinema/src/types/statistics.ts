export interface MoviePopularityDto {
    movieName: string;
    ticketsSold: number;
    totalRevenue: number;
}

export interface HallOccupancyDto {
    hallName: string;
    occupancyPercentage: number;
    totalSeats: number;
    soldSeats: number;
}

export interface PeakHourDto {
    day: number; // 0 - Sunday, 1 - Monday...
    hour: number;
    count: number;
}

export interface GenreStatDto {
    genreName: string;
    ticketsSold: number;
    percentage: number;
}

// endpoint /api/statistics/dashboard
export interface DashboardStatsResponse {
    topMovies: MoviePopularityDto[];
    hallOccupancy: HallOccupancyDto[];
    peakHours: PeakHourDto[];
    genreStats: GenreStatDto[];
}