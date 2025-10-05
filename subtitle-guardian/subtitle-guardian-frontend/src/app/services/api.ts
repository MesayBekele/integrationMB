import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Movie {
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

export interface AnalysisRequest {
  movieId: string;
  topics: string[];
  customKeywords?: string[];
  generateSummary?: boolean;
}

export interface AnalysisResults {
  analysisId: string;
  overallRating: {
    score: number;
    ageRecommendation: string;
    confidence: number;
  };
  topicScores: TopicScore[];
  flaggedExcerpts: FlaggedExcerpt[];
  summary?: MovieSummary;
  statistics: {
    totalSubtitleLines: number;
    totalWords: number;
    processingDuration: number;
    flaggedPercentage: number;
  };
}

export interface TopicScore {
  topic: string;
  score: number;
  confidence: number;
  occurrences: number;
  severity: 'low' | 'medium' | 'high';
  examples: string[];
}

export interface FlaggedExcerpt {
  timestamp: string;
  text: string;
  topics: string[];
  severity: 'low' | 'medium' | 'high';
  context: string;
}

export interface MovieSummary {
  title: string;
  overview: string;
  themes: string[];
  discussionPoints: DiscussionPoint[];
  ageAppropriate: {
    recommended: string;
    considerations: string[];
  };
  parentalGuidance: {
    beforeWatching: string[];
    duringWatching: string[];
    afterWatching: string[];
  };
}

export interface DiscussionPoint {
  topic: string;
  description: string;
  questions: string[];
  ageGroup: string;
}

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  subscription: {
    plan: 'free' | 'premium';
    status: 'active' | 'inactive' | 'cancelled';
    searchesUsed: number;
    searchLimit: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  // Authentication
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password });
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }

  private loadCurrentUser(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.getCurrentUser().subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/auth/me`, {
      headers: this.getAuthHeaders()
    });
  }

  // Movie search
  searchMovies(query: string, year?: number): Observable<Movie[]> {
    const params: any = { query };
    if (year) params.year = year;
    
    return this.http.get<Movie[]>(`${this.baseUrl}/movies/search`, {
      params,
      headers: this.getAuthHeaders()
    });
  }

  getMovie(movieId: string): Observable<Movie> {
    return this.http.get<Movie>(`${this.baseUrl}/movies/${movieId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Content analysis
  analyzeMovie(request: AnalysisRequest): Observable<{ analysisId: string }> {
    return this.http.post<{ analysisId: string }>(`${this.baseUrl}/analysis/analyze`, request, {
      headers: this.getAuthHeaders()
    });
  }

  getAnalysisResults(analysisId: string): Observable<AnalysisResults> {
    return this.http.get<AnalysisResults>(`${this.baseUrl}/analysis/${analysisId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getAnalysisProgress(analysisId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/analysis/${analysisId}/progress`, {
      headers: this.getAuthHeaders()
    });
  }

  // User analysis history
  getUserAnalyses(): Observable<AnalysisResults[]> {
    return this.http.get<AnalysisResults[]>(`${this.baseUrl}/analysis/history`, {
      headers: this.getAuthHeaders()
    });
  }

  // Subscription management
  createSubscription(): Observable<any> {
    return this.http.post(`${this.baseUrl}/subscriptions/create`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  cancelSubscription(): Observable<any> {
    return this.http.post(`${this.baseUrl}/subscriptions/cancel`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  getSubscriptionStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/subscriptions/status`, {
      headers: this.getAuthHeaders()
    });
  }

  // Payment processing
  createPaymentIntent(amount: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/create-intent`, { amount }, {
      headers: this.getAuthHeaders()
    });
  }

  // Utility methods
  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  canMakeAnalysis(): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    return user.subscription.plan === 'premium' || 
           user.subscription.searchesUsed < user.subscription.searchLimit;
  }
}

