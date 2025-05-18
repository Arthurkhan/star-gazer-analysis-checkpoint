import { AnalysisData, RecommendationResponse } from '../types/reviews';
import { BusinessType } from '../types/businessTypes';
import { browserAI } from './ai/browserAI';

// AI provider enum
export enum AIProvider {
  BROWSER = 'browser',
  CLOUD = 'cloud'
}

// Default AI provider
const DEFAULT_PROVIDER = AIProvider.BROWSER;

/**
 * Recommendation Service
 * Manages AI recommendations from different providers
 */
export class RecommendationService {
  private provider: AIProvider;
  private apiKey: string | null;
  
  constructor(provider: AIProvider = DEFAULT_PROVIDER, apiKey: string | null = null) {
    this.provider = provider;
    this.apiKey = apiKey;
  }
  
  /**
   * Generate recommendations based on analysis data and business type
   */
  async generateRecommendations(
    analysisData: AnalysisData,
    businessType: BusinessType
  ): Promise<RecommendationResponse> {
    if (this.provider === AIProvider.BROWSER) {
      return this.generateBrowserRecommendations(analysisData, businessType);
    } else {
      return this.generateCloudRecommendations(analysisData, businessType);
    }
  }
  
  /**
   * Generate recommendations using the browser-based AI
   */
  private async generateBrowserRecommendations(
    analysisData: AnalysisData,
    businessType: BusinessType
  ): Promise<RecommendationResponse> {
    try {
      return await browserAI.generateRecommendations(analysisData, businessType);
    } catch (error) {
      console.error('Browser AI error:', error);
      // Fallback to cloud if available
      if (this.apiKey) {
        console.log('Falling back to cloud AI');
        return this.generateCloudRecommendations(analysisData, businessType);
      }
      throw error;
    }
  }
  
  /**
   * Generate recommendations using the cloud-based AI
   */
  private async generateCloudRecommendations(
    analysisData: AnalysisData,
    businessType: BusinessType
  ): Promise<RecommendationResponse> {
    if (!this.apiKey) {
      throw new Error('API key is required for cloud AI recommendations');
    }
    
    try {
      // Call Edge Function
      const response = await fetch('/api/generate-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisData,
          businessType,
          provider: AIProvider.CLOUD,
          apiKey: this.apiKey
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Cloud AI error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Cloud AI error:', error);
      throw error;
    }
  }
  
  /**
   * Change the AI provider
   */
  setProvider(provider: AIProvider): void {
    this.provider = provider;
  }
  
  /**
   * Set the API key for cloud providers
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();
