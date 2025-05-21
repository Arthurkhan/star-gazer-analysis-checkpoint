import { Review } from '@/types/reviews';

/**
 * Utility function to log stats about reviews for debugging
 */
export const logReviewStats = (businessName: string, reviews: Review[]) => {
  console.log(`------------- ${businessName} Stats -------------`);
  console.log(`Total reviews: ${reviews.length}`);
  
  // Get date range
  if (reviews.length > 0) {
    const datesWithTimestamps = reviews
      .filter(r => r.publishedAtDate)
      .map(r => new Date(r.publishedAtDate).getTime());
    
    if (datesWithTimestamps.length > 0) {
      const oldestDate = new Date(Math.min(...datesWithTimestamps));
      const newestDate = new Date(Math.max(...datesWithTimestamps));
      console.log(`Date range: ${oldestDate.toLocaleDateString()} to ${newestDate.toLocaleDateString()}`);
      
      // Count by year
      const yearCounts = reviews.reduce((acc, review) => {
        if (review.publishedAtDate) {
          const year = new Date(review.publishedAtDate).getFullYear();
          acc[year] = (acc[year] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>);
      
      console.log('Reviews by year:', yearCounts);
    }
  }
  
  console.log('--------------------------------------');
};

/**
 * Function to check for possible date filtering
 */
export const checkForDateFiltering = (businessName: string, reviews: Review[]) => {
  // Check if all reviews are from a recent period (e.g., last 3 months)
  if (reviews.length > 0) {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    
    const recentReviews = reviews.filter(review => {
      if (!review.publishedAtDate) return false;
      const reviewDate = new Date(review.publishedAtDate);
      return reviewDate >= threeMonthsAgo;
    });
    
    const percentRecent = (recentReviews.length / reviews.length) * 100;
    
    if (percentRecent > 95) {
      console.warn(`WARNING: ${businessName} - ${percentRecent.toFixed(1)}% of reviews are from the last 3 months. Possible date filtering.`);
    }
  }
};
