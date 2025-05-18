// Review data type definitions

export interface Review {
  stars: number;
  name: string;
  text: string;
  textTranslated?: string;
  publishedAtDate: string;
  reviewUrl: string;
  responseFromOwnerText?: string;
  sentiment?: string;
  staffMentioned?: string;
  mainThemes?: string;
}

export interface AnalysisData {
  reviews: Review[];
  metrics: ReviewMetrics;
  themes: ThemeAnalysis[];
  sentiment: SentimentAnalysis;
  staffMentions: StaffMention[];
  trends: TrendData;
}

export interface ReviewMetrics {
  totalReviews: number;
  avgRating: number;
  positiveReviews: number;
  neutralReviews: number;
  negativeReviews: number;
  responsesFromOwner: number;
  responseRate: number;
}

export interface ThemeAnalysis {
  theme: string;
  count: number;
  sentiment: number; // -1 to 1
  reviews: number[]; // indices of reviews mentioning this theme
}

export interface SentimentAnalysis {
  overall: number; // -1 to 1
  byMonth: {
    month: string;
    sentiment: number;
    count: number;
  }[];
  byTheme: {
    theme: string;
    sentiment: number;
  }[];
}

export interface StaffMention {
  name: string;
  count: number;
  sentiment: number;
  reviews: number[]; // indices of reviews mentioning this staff member
}

export interface TrendData {
  ratingTrend: {
    month: string;
    avgRating: number;
    count: number;
  }[];
  themeTrend: {
    month: string;
    themes: {
      theme: string;
      count: number;
    }[];
  }[];
}

export interface PeriodComparison {
  ratingChange: number;
  reviewGrowth: number;
  sentimentShift: number;
  emergingThemes: string[];
  decliningThemes: string[];
  improvingAreas: string[];
  decliningAreas: string[];
}

export interface RecommendationResponse {
  urgentActions: string[];
  growthStrategies: string[];
  marketingIdeas: string[];
  competitivePositioning: string[];
  futureScenarios: string[];
}
