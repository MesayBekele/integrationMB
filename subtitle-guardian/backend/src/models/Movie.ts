export interface Movie {
  movieId: string;
  imdbId: string;
  tmdbId?: string;
  title: string;
  year: number;
  genre: string[];
  director: string;
  cast: string[];
  plot: string;
  posterUrl?: string;
  runtime: number;
  rating: string; // PG, PG-13, R, etc.
  language: string;
  subtitles: {
    available: boolean;
    languages: string[];
    sources: SubtitleSource[];
  };
  createdAt: string;
  updatedAt: string;
  lastAnalyzed?: string;
  analysisCount: number;
}

export interface SubtitleSource {
  sourceId: string;
  language: string;
  provider: 'opensubtitles' | 'manual';
  downloadUrl?: string;
  s3Key?: string;
  quality: number; // 1-10 rating
  uploadedAt: string;
}

export interface MovieSearchRequest {
  query: string;
  year?: number;
  type?: 'movie' | 'tv' | 'all';
  limit?: number;
}

export interface MovieSearchResult {
  movieId: string;
  imdbId: string;
  title: string;
  year: number;
  type: 'movie' | 'tv';
  posterUrl?: string;
  plot: string;
  hasSubtitles: boolean;
  lastAnalyzed?: string;
}

