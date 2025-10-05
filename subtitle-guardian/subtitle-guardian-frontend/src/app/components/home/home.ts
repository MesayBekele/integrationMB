import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, User } from '../../services/api';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  currentUser$: Observable<User | null>;
  searchQuery = '';
  showLogin = false;
  showSignup = false;
  isLoading = false;

  loginData = {
    email: '',
    password: ''
  };

  signupData = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.currentUser$ = this.apiService.currentUser$;
  }

  ngOnInit(): void {
    // Component initialization
  }

  searchMovies(): void {
    if (!this.searchQuery.trim()) return;
    
    // Navigate to search results with query
    this.router.navigate(['/search'], { 
      queryParams: { q: this.searchQuery.trim() } 
    });
  }

  async login(): Promise<void> {
    if (!this.loginData.email || !this.loginData.password) return;

    this.isLoading = true;
    try {
      const response = await this.apiService.login(
        this.loginData.email, 
        this.loginData.password
      ).toPromise();

      if (response.token) {
        localStorage.setItem('authToken', response.token);
        this.apiService.updateCurrentUser(response.user);
        this.showLogin = false;
        this.resetLoginForm();
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      this.isLoading = false;
    }
  }

  async signup(): Promise<void> {
    if (!this.signupData.email || !this.signupData.password || 
        !this.signupData.firstName || !this.signupData.lastName) return;

    this.isLoading = true;
    try {
      const response = await this.apiService.register(this.signupData).toPromise();

      if (response.token) {
        localStorage.setItem('authToken', response.token);
        this.apiService.updateCurrentUser(response.user);
        this.showSignup = false;
        this.resetSignupForm();
      }
    } catch (error) {
      console.error('Signup failed:', error);
      alert('Signup failed. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  logout(): void {
    this.apiService.logout();
  }

  private resetLoginForm(): void {
    this.loginData = {
      email: '',
      password: ''
    };
  }

  private resetSignupForm(): void {
    this.signupData = {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    };
  }
}

