import { supabase } from '@/integrations/supabase/client';
import { Review, AnalysisData, ReviewMetrics, ThemeAnalysis, SentimentAnalysis, StaffMention, TrendData } from '../types/reviews';
import { BusinessName } from '../types/businessTypes';

/**
 * Review Data Service
 * Handles fetching and processing review data from Supabase
 */
export class ReviewDataService {
  /**
   * Fetch reviews for a specific business
   */
  async fetchReviews(businessName: BusinessName): Promise<Review[]> {
    try {
      let query = supabase
        .from(businessName)
        .select('*');
      
      // No date filtering - ensure we get all reviews regardless of business
      // Sort by date descending to get newest first
      query = query.order('publishedAtDate', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Log the number of reviews fetched for debugging
      console.log(`Fetched ${data?.length || 0} reviews for ${businessName}`);
      
      return data || [];
    } catch (error) {
      console.error(`Error fetching reviews for ${businessName}:`, error);
      throw error;
    }
  }
  
  /**
   * Process reviews into analysis data
   */
  processReviews(reviews: Review[]): AnalysisData {
    // Log the date range of reviews for debugging
    if (reviews.length > 0) {
      const dates = reviews
        .filter(r => r.publishedAtDate)
        .map(r => new Date(r.publishedAtDate).getTime());
      
      if (dates.length > 0) {
        const oldestDate = new Date(Math.min(...dates));
        const newestDate = new Date(Math.max(...dates));
        console.log(`Reviews date range: ${oldestDate.toISOString()} to ${newestDate.toISOString()}`);
      }
    }
    
    return {
      reviews,
      metrics: this.calculateMetrics(reviews),
      themes: this.extractThemes(reviews),
      sentiment: this.analyzeSentiment(reviews),
      staffMentions: this.extractStaffMentions(reviews),
      trends: this.analyzeTrends(reviews)
    };
  }
  
  /**
   * Calculate review metrics
   */
  private calculateMetrics(reviews: Review[]): ReviewMetrics {
    const totalReviews = reviews.length;
    
    // Count reviews by sentiment
    const sentimentCounts = reviews.reduce(
      (counts, review) => {
        const sentiment = review.sentiment || '';
        if (sentiment.includes('positive')) counts.positive++;
        else if (sentiment.includes('negative')) counts.negative++;
        else counts.neutral++;
        return counts;
      },
      { positive: 0, negative: 0, neutral: 0 }
    );
    
    // Calculate average rating
    const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
    const avgRating = totalReviews > 0 ? totalStars / totalReviews : 0;
    
    // Count owner responses
    const responsesFromOwner = reviews.filter(review => 
      review.responseFromOwnerText && review.responseFromOwnerText.trim().length > 0
    ).length;
    
    return {
      totalReviews,
      avgRating,
      positiveReviews: sentimentCounts.positive,
      neutralReviews: sentimentCounts.neutral,
      negativeReviews: sentimentCounts.negative,
      responsesFromOwner,
      responseRate: totalReviews > 0 ? responsesFromOwner / totalReviews : 0
    };
  }
  
  /**
   * Extract themes from reviews
   */
  private extractThemes(reviews: Review[]): ThemeAnalysis[] {
    // Collect all themes
    const themesMap = new Map<string, {count: number; sentiment: number; reviews: number[]}>();
    
    reviews.forEach((review, index) => {
      if (!review.mainThemes) return;
      
      // Parse themes (stored as JSON string or comma-separated list)
      let themes: string[] = [];
      try {
        themes = typeof review.mainThemes === 'string' 
          ? JSON.parse(review.mainThemes)
          : review.mainThemes;
      } catch {
        // If parsing fails, try as comma-separated list
        themes = review.mainThemes.split(',').map(t => t.trim());
      }
      
      // Skip if no themes found
      if (!themes || !themes.length) return;
      
      // Calculate sentiment value (from -1 to 1)
      const sentimentValue = this.getSentimentValue(review.sentiment || '');
      
      // Add each theme to the map
      themes.forEach(theme => {
        if (!theme || theme.trim() === '') return;
        
        const themeKey = theme.trim().toLowerCase();
        if (themesMap.has(themeKey)) {
          const existing = themesMap.get(themeKey)!;
          existing.count++;
          existing.sentiment += sentimentValue;
          existing.reviews.push(index);
        } else {
          themesMap.set(themeKey, {
            count: 1,
            sentiment: sentimentValue,
            reviews: [index]
          });
        }
      });
    });
    
    // Convert map to array and calculate average sentiment
    return Array.from(themesMap.entries()).map(([theme, data]) => ({
      theme,
      count: data.count,
      sentiment: data.count > 0 ? data.sentiment / data.count : 0,
      reviews: data.reviews
    })).sort((a, b) => b.count - a.count);
  }
  
  /**
   * Analyze sentiment from reviews
   */
  private analyzeSentiment(reviews: Review[]): SentimentAnalysis {
    // Calculate overall sentiment
    const overallSentiment = reviews.reduce(
      (sum, review) => sum + this.getSentimentValue(review.sentiment || ''),
      0
    ) / (reviews.length || 1);
    
    // Calculate sentiment by month
    const byMonth = this.calculateSentimentByMonth(reviews);
    
    // Calculate sentiment by theme
    const byTheme = this.extractThemes(reviews)
      .slice(0, 10)
      .map(theme => ({
        theme: theme.theme,
        sentiment: theme.sentiment
      }));
    
    return {
      overall: overallSentiment,
      byMonth,
      byTheme
    };
  }
  
  /**
   * Extract staff mentions from reviews
   */
  private extractStaffMentions(reviews: Review[]): StaffMention[] {
    // Collect staff mentions
    const staffMap = new Map<string, {count: number; sentiment: number; reviews: number[]}>();
    
    reviews.forEach((review, index) => {
      if (!review.staffMentioned) return;
      
      // Parse staff mentions (stored as JSON string or comma-separated list)
      let staffMembers: string[] = [];
      try {
        staffMembers = typeof review.staffMentioned === 'string'
          ? JSON.parse(review.staffMentioned)
          : review.staffMentioned;
      } catch {
        // If parsing fails, try as comma-separated list
        staffMembers = review.staffMentioned.split(',').map(s => s.trim());
      }
      
      // Skip if no staff mentioned
      if (!staffMembers || !staffMembers.length) return;
      
      // Calculate sentiment value
      const sentimentValue = this.getSentimentValue(review.sentiment || '');
      
      // Add each staff member to the map
      staffMembers.forEach(staff => {
        if (!staff || staff.trim() === '') return;
        
        const staffKey = staff.trim();
        if (staffMap.has(staffKey)) {
          const existing = staffMap.get(staffKey)!;
          existing.count++;
          existing.sentiment += sentimentValue;
          existing.reviews.push(index);
        } else {
          staffMap.set(staffKey, {
            count: 1,
            sentiment: sentimentValue,
            reviews: [index]
          });
        }
      });
    });
    
    // Convert map to array and calculate average sentiment
    return Array.from(staffMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      sentiment: data.count > 0 ? data.sentiment / data.count : 0,
      reviews: data.reviews
    })).sort((a, b) => b.count - a.count);
  }
  
  /**
   * Analyze trends from reviews
   */
  private analyzeTrends(reviews: Review[]): TrendData {
    // Calculate rating trend by month
    const ratingTrend = this.calculateRatingByMonth(reviews);
    
    // Calculate theme trends by month
    const themeTrend = this.calculateThemesByMonth(reviews);
    
    return {
      ratingTrend,
      themeTrend
    };
  }
  
  /**
   * Calculate sentiment value from sentiment string
   */
  private getSentimentValue(sentiment: string): number {
    if (sentiment.includes('very positive')) return 1;
    if (sentiment.includes('positive')) return 0.5;
    if (sentiment.includes('very negative')) return -1;
    if (sentiment.includes('negative')) return -0.5;
    return 0; // neutral
  }
  
  /**
   * Calculate sentiment by month
   */
  private calculateSentimentByMonth(reviews: Review[]): {month: string; sentiment: number; count: number}[] {
    const months = new Map<string, {sum: number; count: number}>();
    
    reviews.forEach(review => {
      // Skip if no publishedAtDate
      if (!review.publishedAtDate) return;
      
      // Format month
      const date = new Date(review.publishedAtDate);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Calculate sentiment
      const sentiment = this.getSentimentValue(review.sentiment || '');
      
      // Add to map
      if (months.has(month)) {
        const existing = months.get(month)!;
        existing.sum += sentiment;
        existing.count++;
      } else {
        months.set(month, { sum: sentiment, count: 1 });
      }
    });
    
    // Convert map to array and calculate average sentiment
    return Array.from(months.entries())
      .map(([month, data]) => ({
        month,
        sentiment: data.count > 0 ? data.sum / data.count : 0,
        count: data.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
  
  /**
   * Calculate rating by month
   */
  private calculateRatingByMonth(reviews: Review[]): {month: string; avgRating: number; count: number}[] {
    const months = new Map<string, {sum: number; count: number}>();
    
    reviews.forEach(review => {
      // Skip if no publishedAtDate
      if (!review.publishedAtDate) return;
      
      // Format month
      const date = new Date(review.publishedAtDate);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Add to map
      if (months.has(month)) {
        const existing = months.get(month)!;
        existing.sum += review.stars;
        existing.count++;
      } else {
        months.set(month, { sum: review.stars, count: 1 });
      }
    });
    
    // Convert map to array and calculate average rating
    return Array.from(months.entries())
      .map(([month, data]) => ({
        month,
        avgRating: data.count > 0 ? data.sum / data.count : 0,
        count: data.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
  
  /**
   * Calculate themes by month
   */
  private calculateThemesByMonth(reviews: Review[]): {month: string; themes: {theme: string; count: number}[]}[] {
    const months = new Map<string, Map<string, number>>();
    
    reviews.forEach(review => {
      // Skip if no mainThemes or publishedAtDate
      if (!review.mainThemes || !review.publishedAtDate) return;
      
      // Parse themes
      let themes: string[] = [];
      try {
        themes = typeof review.mainThemes === 'string'
          ? JSON.parse(review.mainThemes)
          : review.mainThemes;
      } catch {
        themes = review.mainThemes.split(',').map(t => t.trim());
      }
      
      // Skip if no themes found
      if (!themes || !themes.length) return;
      
      // Format month
      const date = new Date(review.publishedAtDate);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Create month entry if it doesn't exist
      if (!months.has(month)) {
        months.set(month, new Map<string, number>());
      }
      
      // Add themes to month
      const monthThemes = months.get(month)!;
      themes.forEach(theme => {
        if (!theme || theme.trim() === '') return;
        
        const themeKey = theme.trim().toLowerCase();
        monthThemes.set(themeKey, (monthThemes.get(themeKey) || 0) + 1);
      });
    });
    
    // Convert map to array
    return Array.from(months.entries())
      .map(([month, themesMap]) => ({
        month,
        themes: Array.from(themesMap.entries())
          .map(([theme, count]) => ({ theme, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5) // Top 5 themes per month
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}

// Export singleton instance
export const reviewDataService = new ReviewDataService();
