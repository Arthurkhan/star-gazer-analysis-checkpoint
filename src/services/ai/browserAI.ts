import { AnalysisData, RecommendationResponse } from '../../types/reviews';
import { BusinessType } from '../../types/businessTypes';

/**
 * Browser AI Service
 * Uses Transformers.js for local, browser-based AI processing
 */
class BrowserAIService {
  private model: any | null = null;
  private modelLoaded: boolean = false;
  
  constructor() {
    // Load the model asynchronously when the service is instantiated
    this.loadModel();
  }
  
  /**
   * Load the AI model
   */
  private async loadModel(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        // Import is done dynamically to avoid SSR issues
        const { pipeline } = await import('@xenova/transformers');
        
        // Load text generation model
        this.model = await pipeline(
          'text-generation',
          'Xenova/distilgpt2',  // Using a smaller model for browser
          { quantized: true }   // Use quantized model for better performance
        );
        
        this.modelLoaded = true;
        console.log('Browser AI model loaded successfully');
      }
    } catch (error) {
      console.error('Error loading browser AI model:', error);
      this.modelLoaded = false;
    }
  }
  
  /**
   * Generate recommendations based on analysis data and business type
   */
  async generateRecommendations(
    analysisData: AnalysisData,
    businessType: BusinessType
  ): Promise<RecommendationResponse> {
    // Wait for model to load if not loaded yet
    if (!this.modelLoaded) {
      await this.waitForModelLoad();
    }
    
    if (!this.model) {
      throw new Error('Browser AI model failed to load');
    }
    
    try {
      // Create a prompt for the AI model
      const prompt = this.createPrompt(analysisData, businessType);
      
      // Generate text with the model
      const result = await this.model(prompt, {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
      });
      
      // Parse the generated text into recommendations
      return this.parseGeneratedText(result[0].generated_text);
    } catch (error) {
      console.error('Error generating recommendations with browser AI:', error);
      throw error;
    }
  }
  
  /**
   * Wait for the model to load
   */
  private async waitForModelLoad(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const checkInterval = 500; // 0.5 seconds
      const maxWaitTime = 30000; // 30 seconds
      let waitedTime = 0;
      
      const intervalId = setInterval(() => {
        if (this.modelLoaded) {
          clearInterval(intervalId);
          resolve();
        } else {
          waitedTime += checkInterval;
          if (waitedTime >= maxWaitTime) {
            clearInterval(intervalId);
            reject(new Error('Timed out waiting for browser AI model to load'));
          }
        }
      }, checkInterval);
    });
  }
  
  /**
   * Create a prompt for the AI model based on the analysis data and business type
   */
  private createPrompt(analysisData: AnalysisData, businessType: BusinessType): string {
    // Format key data points for the prompt
    const { metrics, themes, sentiment, staffMentions, trends } = analysisData;
    
    // Create a business-specific context
    let businessContext = '';
    switch (businessType) {
      case BusinessType.CAFE:
        businessContext = 'a cafe serving coffee, pastries, and light meals';
        break;
      case BusinessType.BAR:
        businessContext = 'a cocktail bar with a speakeasy atmosphere and live music';
        break;
      case BusinessType.GALLERY:
        businessContext = 'an art gallery showcasing contemporary artists';
        break;
    }
    
    // Format the top themes
    const topThemes = themes
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(t => `${t.theme} (mentioned ${t.count} times, sentiment: ${t.sentiment.toFixed(2)})`);
    
    // Format staff mentions if any
    const staffInfo = staffMentions.length > 0
      ? staffMentions
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(s => `${s.name} (mentioned ${s.count} times, sentiment: ${s.sentiment.toFixed(2)})`)
      : ['No staff specifically mentioned'];
    
    // Build the prompt
    return `
      You are an expert business consultant. Based on the following customer review data for ${businessContext}, 
      provide strategic recommendations in these categories: urgent actions, growth strategies, marketing ideas, 
      competitive positioning, and future scenarios.
      
      REVIEW METRICS:
      Total reviews: ${metrics.totalReviews}
      Average rating: ${metrics.avgRating.toFixed(1)}/5
      Positive reviews: ${metrics.positiveReviews} (${((metrics.positiveReviews / metrics.totalReviews) * 100).toFixed(0)}%)
      Neutral reviews: ${metrics.neutralReviews} (${((metrics.neutralReviews / metrics.totalReviews) * 100).toFixed(0)}%)
      Negative reviews: ${metrics.negativeReviews} (${((metrics.negativeReviews / metrics.totalReviews) * 100).toFixed(0)}%)
      Overall sentiment: ${sentiment.overall.toFixed(2)} (-1 to 1 scale)
      
      TOP THEMES:
      ${topThemes.join('\n')}
      
      STAFF MENTIONS:
      ${staffInfo.join('\n')}
      
      RECOMMENDATIONS:
      urgentActions:
      `;
  }
  
  /**
   * Parse generated text into structured recommendations
   */
  private parseGeneratedText(text: string): RecommendationResponse {
    // Default empty recommendations
    const recommendations: RecommendationResponse = {
      urgentActions: [],
      growthStrategies: [],
      marketingIdeas: [],
      competitivePositioning: [],
      futureScenarios: []
    };
    
    try {
      // Simple parsing logic - find sections and extract bullet points
      // This is a simplified version and would need improvement
      
      // Extract urgent actions
      const urgentActionsMatch = text.match(/urgentActions:([\s\S]*?)(?=growthStrategies:|$)/i);
      if (urgentActionsMatch && urgentActionsMatch[1]) {
        recommendations.urgentActions = this.extractBulletPoints(urgentActionsMatch[1]);
      }
      
      // Extract growth strategies
      const growthStrategiesMatch = text.match(/growthStrategies:([\s\S]*?)(?=marketingIdeas:|$)/i);
      if (growthStrategiesMatch && growthStrategiesMatch[1]) {
        recommendations.growthStrategies = this.extractBulletPoints(growthStrategiesMatch[1]);
      }
      
      // Extract marketing ideas
      const marketingIdeasMatch = text.match(/marketingIdeas:([\s\S]*?)(?=competitivePositioning:|$)/i);
      if (marketingIdeasMatch && marketingIdeasMatch[1]) {
        recommendations.marketingIdeas = this.extractBulletPoints(marketingIdeasMatch[1]);
      }
      
      // Extract competitive positioning
      const competitivePositioningMatch = text.match(/competitivePositioning:([\s\S]*?)(?=futureScenarios:|$)/i);
      if (competitivePositioningMatch && competitivePositioningMatch[1]) {
        recommendations.competitivePositioning = this.extractBulletPoints(competitivePositioningMatch[1]);
      }
      
      // Extract future scenarios
      const futureScenariosMatch = text.match(/futureScenarios:([\s\S]*?)(?=$)/i);
      if (futureScenariosMatch && futureScenariosMatch[1]) {
        recommendations.futureScenarios = this.extractBulletPoints(futureScenariosMatch[1]);
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error parsing generated text:', error);
      
      // Return some generic recommendations if parsing fails
      return {
        urgentActions: ['Address customer service issues', 'Improve response time to reviews'],
        growthStrategies: ['Focus on core strengths', 'Consider expanding popular offerings'],
        marketingIdeas: ['Leverage positive reviews in social media', 'Create loyalty program'],
        competitivePositioning: ['Emphasize unique atmosphere', 'Highlight quality of products/services'],
        futureScenarios: ['Prepare for seasonal variations', 'Explore potential partnerships']
      };
    }
  }
  
  /**
   * Extract bullet points from text
   */
  private extractBulletPoints(text: string): string[] {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('•') || /^\d+\./.test(line))
      .map(line => line.replace(/^[-•\d]+\.?\s*/, ''))
      .filter(line => line.length > 0);
    
    // If no bullet points found, try to split by sentences
    if (lines.length === 0) {
      return text
        .split(/[.!?]+/)
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 10)
        .slice(0, 3);
    }
    
    return lines;
  }
}

// Export singleton instance
export const browserAI = new BrowserAIService();
