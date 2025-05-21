import { useState, useEffect } from 'react';
import { AnalysisData, RecommendationResponse } from '@/types/reviews';
import { BusinessName, BusinessType } from '@/types/businessTypes';
import { reviewDataService } from '@/services/reviewDataService';
import { recommendationService, AIProvider } from '@/services/recommendationService';
import { logReviewStats, checkForDateFiltering } from '@/utils/reviewDebugUtils';

/**
 * Custom hook for managing dashboard data
 * Fetches reviews and generates recommendations
 */
export const useDashboardData = (
  businessName: BusinessName,
  businessType: BusinessType,
  provider: AIProvider = AIProvider.BROWSER,
  apiKey: string | null = null
) => {
  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);

  // Set up recommendation service
  useEffect(() => {
    recommendationService.setProvider(provider);
    if (apiKey) {
      recommendationService.setApiKey(apiKey);
    }
  }, [provider, apiKey]);

  // Fetch review data when business changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setRecommendations(null);

      try {
        // Fetch reviews
        const reviews = await reviewDataService.fetchReviews(businessName);
        
        // Debug: Log review stats
        logReviewStats(businessName, reviews);
        checkForDateFiltering(businessName, reviews);
        
        // Process reviews into analysis data
        const data = reviewDataService.processReviews(reviews);
        
        setAnalysisData(data);
      } catch (err) {
        console.error('Error fetching review data:', err);
        setError('Failed to fetch review data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessName]);

  // Generate recommendations function
  const generateRecommendations = async () => {
    if (!analysisData) return;

    setLoading(true);
    setError(null);

    try {
      // Generate recommendations
      const recData = await recommendationService.generateRecommendations(
        analysisData,
        businessType
      );
      
      setRecommendations(recData);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('Failed to generate recommendations. Please try again.');
      
      // If using cloud provider and failed, suggest checking API key
      if (provider === AIProvider.CLOUD) {
        setError('Failed to generate recommendations. Please check your API key and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    analysisData,
    recommendations,
    generateRecommendations
  };
};
