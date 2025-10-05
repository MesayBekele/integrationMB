import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { MovieSearchComponent } from './components/movie-search/movie-search';
import { TopicSelectionComponent } from './components/topic-selection/topic-selection';
import { AnalysisResultsComponent } from './components/analysis-results/analysis-results';
import { SubscriptionComponent } from './components/subscription/subscription';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: MovieSearchComponent },
  { path: 'topics/:movieId', component: TopicSelectionComponent },
  { path: 'results/:analysisId', component: AnalysisResultsComponent },
  { path: 'subscription', component: SubscriptionComponent },
  { path: '**', redirectTo: '' }
];
