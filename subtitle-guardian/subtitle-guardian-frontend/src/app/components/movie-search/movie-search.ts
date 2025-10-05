import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, Movie, User } from '../../services/api';

@Component({
  selector: 'app-movie-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movie-search.html',
  styleUrls: ['./movie-search.scss']
})
export class MovieSearchComponent implements OnInit {
  searchQuery = '';
  lastSearchQuery = '';
  searchResults: Movie[] = [];
  filteredResults: Movie[] = [];
  isLoading = false;
  searchPerformed = false;
  currentUser: User | null = null;

  filters = {
    moviesOnly: false,
    tvOnly: false,
    year: ''
  };

  yearOptions: number[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Generate year options (current year back to 1900)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
      this.yearOptions.push(year);
    }
  }

  ngOnInit(): void {
    // Get current user
    this.apiService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Check for query parameter from home page
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
        this.searchMovies();
      }
    });
  }

  get canAnalyze(): boolean {
    return this.apiService.canMakeAnalysis();
  }

  async searchMovies(): Promise<void> {
    if (!this.searchQuery.trim()) return;

    this.isLoading = true;
    this.lastSearchQuery = this.searchQuery.trim();
    
    try {
      const results = await this.apiService.searchMovies(this.lastSearchQuery).toPromise();
      this.searchResults = results || [];
      this.applyFilters();
      this.searchPerformed = true;
    } catch (error) {
      console.error('Search failed:', error);
      this.searchResults = [];
      this.filteredResults = [];
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters(): void {
    let filtered = [...this.searchResults];

    if (this.filters.moviesOnly && !this.filters.tvOnly) {
      filtered = filtered.filter(movie => movie.type === 'movie');
    } else if (this.filters.tvOnly && !this.filters.moviesOnly) {
      filtered = filtered.filter(movie => movie.type === 'tv');
    }

    if (this.filters.year) {
      filtered = filtered.filter(movie => movie.year.toString() === this.filters.year);
    }

    this.filteredResults = filtered;
  }

  selectMovie(movie: Movie): void {
    if (!movie.hasSubtitles) {
      alert('This movie/show doesn\'t have subtitles available for analysis.');
      return;
    }

    if (!this.canAnalyze) {
      this.goToSubscription();
      return;
    }

    // Navigate to topic selection
    this.router.navigate(['/topics', movie.movieId]);
  }

  getSelectButtonText(movie: Movie): string {
    if (!movie.hasSubtitles) {
      return 'No Subtitles Available';
    }
    
    if (!this.canAnalyze) {
      return 'Upgrade Required';
    }

    return movie.lastAnalyzed ? 'Analyze Again' : 'Analyze Content';
  }

  onImageError(event: any): void {
    event.target.src = '/assets/no-poster.png';
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  goToSubscription(): void {
    this.router.navigate(['/subscription']);
  }
}

