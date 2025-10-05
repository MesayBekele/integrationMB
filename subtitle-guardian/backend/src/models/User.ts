export interface User {
  userId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  emailVerified: boolean;
  subscription: {
    plan: 'free' | 'premium';
    status: 'active' | 'inactive' | 'cancelled';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    searchesUsed: number;
    searchLimit: number;
  };
  preferences: {
    defaultTopics: string[];
    customKeywords: string[];
    ageRatingPreference: string;
    notificationSettings: {
      email: boolean;
      analysisComplete: boolean;
      subscriptionUpdates: boolean;
    };
  };
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  preferences?: Partial<User['preferences']>;
}

