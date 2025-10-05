export interface ContentAnalysis {
  analysisId: string;
  movieId: string;
  userId: string;
  requestedTopics: string[];
  customKeywords: string[];
  results: AnalysisResults;
  summary: MovieSummary;
  createdAt: string;
  processingTime: number; // in milliseconds
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

export interface AnalysisResults {
  overallRating: {
    score: number; // 1-10 (1 = very inappropriate, 10 = very appropriate)
    ageRecommendation: string; // "6+", "13+", "17+", etc.
    confidence: number; // 0-1
  };
  topicScores: TopicScore[];
  flaggedExcerpts: FlaggedExcerpt[];
  statistics: {
    totalSubtitleLines: number;
    totalWords: number;
    processingDuration: number;
    flaggedPercentage: number;
  };
}

export interface TopicScore {
  topic: string;
  score: number; // 0-10 (0 = none detected, 10 = very high)
  confidence: number; // 0-1
  occurrences: number;
  severity: 'low' | 'medium' | 'high';
  examples: string[]; // Sample phrases that triggered this topic
}

export interface FlaggedExcerpt {
  timestamp: string; // subtitle timestamp
  text: string;
  topics: string[];
  severity: 'low' | 'medium' | 'high';
  context: string; // surrounding text for context
}

export interface MovieSummary {
  title: string;
  overview: string; // 1000-word discussion summary
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
  generatedAt: string;
}

export interface DiscussionPoint {
  topic: string;
  description: string;
  questions: string[];
  ageGroup: string; // "6-9", "10-13", "14+", etc.
}

export interface AnalysisRequest {
  movieId: string;
  topics: string[];
  customKeywords?: string[];
  generateSummary?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

export interface AnalysisProgress {
  analysisId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep: string;
  estimatedTimeRemaining?: number; // in seconds
}

