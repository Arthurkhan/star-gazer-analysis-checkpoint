import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useDashboardData } from '@/hooks/useDashboardData';
import { BusinessType, businessSettings, BusinessName, businessTypeMap } from '@/types/businessTypes';
import { RecommendationCard } from './RecommendationCard';
import { SentimentChart } from './charts/SentimentChart';
import { RatingTrendChart } from './charts/RatingTrendChart';
import { ThemeDistributionChart } from './charts/ThemeDistributionChart';
import { AIProvider } from '@/services/recommendationService';

/**
 * Recommendations Dashboard Component
 * Main dashboard for displaying review analysis and AI recommendations
 */
export const RecommendationsDashboard: React.FC = () => {
  // Get business names from types
  const businessNames: BusinessName[] = [
    'The Little Prince Cafe',
    'Vol de Nuit, The Hidden Bar',
    "L'Envol Art Space"
  ];

  // State
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessName>(businessNames[0]);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AIProvider.BROWSER);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);

  // Get business type from selected business
  const businessType = businessTypeMap[selectedBusiness] || BusinessType.CAFE;
  
  // Load dashboard data
  const { 
    loading, 
    error, 
    analysisData, 
    recommendations, 
    generateRecommendations 
  } = useDashboardData(selectedBusiness, businessType, selectedProvider, apiKey);

  // Handle business change
  const handleBusinessChange = (value: string) => {
    setSelectedBusiness(value as BusinessName);
  };

  // Handle provider change
  const handleProviderChange = (value: string) => {
    setSelectedProvider(value as AIProvider);
    
    // Show API key input if cloud provider is selected
    if (value === AIProvider.CLOUD) {
      setShowApiKeyInput(true);
    } else {
      setShowApiKeyInput(false);
    }
  };

  // Handle API key change
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  // Handle generate recommendations
  const handleGenerateRecommendations = () => {
    if (analysisData) {
      generateRecommendations();
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-end">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium mb-1">Business</label>
          <Select value={selectedBusiness} onValueChange={handleBusinessChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select business" />
            </SelectTrigger>
            <SelectContent>
              {businessNames.map((business) => (
                <SelectItem key={business} value={business}>
                  {business}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium mb-1">AI Provider</label>
          <Select value={selectedProvider} onValueChange={handleProviderChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select AI provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AIProvider.BROWSER}>Browser (Local)</SelectItem>
              <SelectItem value={AIProvider.CLOUD}>Cloud (OpenAI)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {showApiKeyInput && (
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="Enter API key"
            />
          </div>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription>Overview of review performance</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : analysisData ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Reviews:</span>
                  <span className="text-sm">{analysisData.metrics.totalReviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Average Rating:</span>
                  <span className="text-sm">{analysisData.metrics.avgRating.toFixed(1)}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Positive Reviews:</span>
                  <span className="text-sm">{analysisData.metrics.positiveReviews} ({Math.round((analysisData.metrics.positiveReviews / analysisData.metrics.totalReviews) * 100)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Negative Reviews:</span>
                  <span className="text-sm">{analysisData.metrics.negativeReviews} ({Math.round((analysisData.metrics.negativeReviews / analysisData.metrics.totalReviews) * 100)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Owner Response Rate:</span>
                  <span className="text-sm">{Math.round(analysisData.metrics.responseRate * 100)}%</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Sentiment Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Trend</CardTitle>
            <CardDescription>How sentiment has changed over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse h-48 bg-gray-200 rounded"></div>
            ) : analysisData ? (
              <SentimentChart data={analysisData.sentiment.byMonth} />
            ) : (
              <div className="text-center text-gray-500">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Rating Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Trend</CardTitle>
            <CardDescription>How ratings have changed over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse h-48 bg-gray-200 rounded"></div>
            ) : analysisData ? (
              <RatingTrendChart data={analysisData.trends.ratingTrend} />
            ) : (
              <div className="text-center text-gray-500">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Themes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Themes</CardTitle>
          <CardDescription>Most mentioned topics in reviews</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
          ) : analysisData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ThemeDistributionChart data={analysisData.themes.slice(0, 8)} />
              </div>
              <div className="space-y-3">
                {analysisData.themes.slice(0, 8).map((theme, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate max-w-xs">{theme.theme}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{theme.count} mentions</span>
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          theme.sentiment > 0.3 ? 'bg-green-500' : 
                          theme.sentiment < -0.3 ? 'bg-red-500' : 
                          'bg-yellow-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">No data available</div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">AI Recommendations</h2>
          <Button 
            onClick={handleGenerateRecommendations} 
            disabled={loading || !analysisData}
          >
            {loading ? 'Loading...' : 'Generate Recommendations'}
          </Button>
        </div>
        
        {recommendations ? (
          <div>
            <Tabs defaultValue="urgent">
              <TabsList className="mb-4">
                <TabsTrigger value="urgent">Urgent Actions</TabsTrigger>
                <TabsTrigger value="growth">Growth Strategies</TabsTrigger>
                <TabsTrigger value="marketing">Marketing Ideas</TabsTrigger>
                <TabsTrigger value="competitive">Competitive Positioning</TabsTrigger>
                <TabsTrigger value="future">Future Scenarios</TabsTrigger>
              </TabsList>
              
              <TabsContent value="urgent">
                <RecommendationCard 
                  title="Urgent Actions"
                  description="Issues that need immediate attention"
                  items={recommendations.urgentActions}
                  color="red"
                />
              </TabsContent>
              
              <TabsContent value="growth">
                <RecommendationCard 
                  title="Growth Strategies"
                  description="Ways to expand your business"
                  items={recommendations.growthStrategies}
                  color="green"
                />
              </TabsContent>
              
              <TabsContent value="marketing">
                <RecommendationCard 
                  title="Marketing Ideas"
                  description="Ways to attract more customers"
                  items={recommendations.marketingIdeas}
                  color="purple"
                />
              </TabsContent>
              
              <TabsContent value="competitive">
                <RecommendationCard 
                  title="Competitive Positioning"
                  description="How to stand out from competitors"
                  items={recommendations.competitivePositioning}
                  color="blue"
                />
              </TabsContent>
              
              <TabsContent value="future">
                <RecommendationCard 
                  title="Future Scenarios"
                  description="Potential future developments"
                  items={recommendations.futureScenarios}
                  color="amber"
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card className="w-full">
            <CardContent className="pt-6">
              <div className="text-center p-6">
                <p className="text-gray-500">
                  No recommendations generated yet. Click the button above to generate recommendations.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {selectedProvider === AIProvider.BROWSER ? 
                    'Browser-based AI is faster but less accurate.' : 
                    'Cloud-based AI provides more detailed recommendations but requires an API key.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Note */}
      <Alert className="mb-8 bg-amber-50">
        <AlertTitle>Performance Note</AlertTitle>
        <AlertDescription>
          This is a checkpoint version with known performance limitations, especially with the browser-based AI.
          The recommendations quality needs improvement in future versions.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RecommendationsDashboard;
