// Supabase Edge Function for AI Recommendations
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';

interface RequestData {
  analysisData: any;
  businessType: string;
  provider: string;
  apiKey: string;
}

interface RecommendationResponse {
  urgentActions: string[];
  growthStrategies: string[];
  marketingIdeas: string[];
  competitivePositioning: string[];
  futureScenarios: string[];
}

serve(async (req) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers, status: 204 });
  }

  try {
    // Parse request data
    const data: RequestData = await req.json();
    const { analysisData, businessType, provider, apiKey } = data;

    // Validate inputs
    if (!analysisData || !businessType || !provider || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers, status: 400 }
      );
    }

    // Generate recommendations
    const recommendations = await generateRecommendations(
      analysisData,
      businessType,
      apiKey
    );

    // Return recommendations
    return new Response(JSON.stringify(recommendations), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { headers, status: 500 }
    );
  }
});

/**
 * Generate AI recommendations using OpenAI
 */
async function generateRecommendations(
  analysisData: any,
  businessType: string,
  apiKey: string
): Promise<RecommendationResponse> {
  // Initialize OpenAI client
  const configuration = new Configuration({ apiKey });
  const openai = new OpenAIApi(configuration);

  // Create business context based on business type
  let businessContext = '';
  switch (businessType) {
    case 'CAFE':
      businessContext = 'a cafe serving coffee, pastries, and light meals';
      break;
    case 'BAR':
      businessContext = 'a cocktail bar with a speakeasy atmosphere and live music';
      break;
    case 'GALLERY':
      businessContext = 'an art gallery showcasing contemporary artists';
      break;
    default:
      businessContext = 'a local business';
  }

  // Extract key data for prompt
  const { metrics, themes, sentiment, staffMentions, trends } = analysisData;

  // Format top themes
  const topThemes = themes
    .slice(0, 5)
    .map(t => `${t.theme} (mentioned ${t.count} times, sentiment: ${t.sentiment.toFixed(2)})`);

  // Format staff mentions
  const staffInfo = staffMentions.length > 0
    ? staffMentions
      .slice(0, 3)
      .map(s => `${s.name} (mentioned ${s.count} times, sentiment: ${s.sentiment.toFixed(2)})`)
    : ['No staff specifically mentioned'];

  // Build the prompt
  const prompt = `
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
    
    Please provide recommendations in this JSON format:
    {
      "urgentActions": ["action 1", "action 2", "action 3"],
      "growthStrategies": ["strategy 1", "strategy 2", "strategy 3"],
      "marketingIdeas": ["idea 1", "idea 2", "idea 3"],
      "competitivePositioning": ["position 1", "position 2", "position 3"],
      "futureScenarios": ["scenario 1", "scenario 2", "scenario 3"]
    }
  `;

  try {
    // Make API request
    const response = await openai.createCompletion({
      model: 'gpt-4',
      prompt,
      max_tokens: 1200,
      temperature: 0.7,
      top_p: 0.9,
    });

    // Parse response
    const text = response.data.choices[0]?.text || '';
    
    try {
      // Find JSON object in response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      
      // Fallback parsing using regex
      return parseRecommendationsFromText(text);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Parse recommendations from text if JSON parsing fails
 */
function parseRecommendationsFromText(text: string): RecommendationResponse {
  // Default empty recommendations
  const recommendations: RecommendationResponse = {
    urgentActions: [],
    growthStrategies: [],
    marketingIdeas: [],
    competitivePositioning: [],
    futureScenarios: []
  };
  
  // Extract urgent actions
  const urgentActionsMatch = text.match(/urgentActions[:\[]+([\s\S]*?)(?=growthStrategies|marketing|competitivePositioning|futureScenarios|\]|\}|$)/i);
  if (urgentActionsMatch && urgentActionsMatch[1]) {
    recommendations.urgentActions = extractItems(urgentActionsMatch[1]);
  }
  
  // Extract growth strategies
  const growthStrategiesMatch = text.match(/growthStrategies[:\[]+([\s\S]*?)(?=urgentActions|marketing|competitivePositioning|futureScenarios|\]|\}|$)/i);
  if (growthStrategiesMatch && growthStrategiesMatch[1]) {
    recommendations.growthStrategies = extractItems(growthStrategiesMatch[1]);
  }
  
  // Extract marketing ideas
  const marketingIdeasMatch = text.match(/marketingIdeas[:\[]+([\s\S]*?)(?=urgentActions|growthStrategies|competitivePositioning|futureScenarios|\]|\}|$)/i);
  if (marketingIdeasMatch && marketingIdeasMatch[1]) {
    recommendations.marketingIdeas = extractItems(marketingIdeasMatch[1]);
  }
  
  // Extract competitive positioning
  const competitivePositioningMatch = text.match(/competitivePositioning[:\[]+([\s\S]*?)(?=urgentActions|growthStrategies|marketingIdeas|futureScenarios|\]|\}|$)/i);
  if (competitivePositioningMatch && competitivePositioningMatch[1]) {
    recommendations.competitivePositioning = extractItems(competitivePositioningMatch[1]);
  }
  
  // Extract future scenarios
  const futureScenariosMatch = text.match(/futureScenarios[:\[]+([\s\S]*?)(?=urgentActions|growthStrategies|marketingIdeas|competitivePositioning|\]|\}|$)/i);
  if (futureScenariosMatch && futureScenariosMatch[1]) {
    recommendations.futureScenarios = extractItems(futureScenariosMatch[1]);
  }
  
  return recommendations;
}

/**
 * Extract items from a text section
 */
function extractItems(text: string): string[] {
  // Try to extract items as a list
  const items: string[] = [];
  
  // Look for quoted strings, numbers followed by period, dash bullet points
  const itemRegex = /"([^"]+)"|(\d+\.\s*[^,]+)|(-\s*[^,]+)/g;
  let match;
  
  while ((match = itemRegex.exec(text)) !== null) {
    const item = match[1] || match[2] || match[3];
    if (item && item.trim()) {
      items.push(item.trim().replace(/^[-\d."\s]+|["]+$/g, ''));
    }
  }
  
  // If no items found, try to split by commas or newlines
  if (items.length === 0) {
    return text
      .split(/[,\n]+/)
      .map(line => line.trim().replace(/^[-"\s]+|["]+$/g, ''))
      .filter(line => line.length > 0 && !line.match(/^\d+$/));
  }
  
  return items;
}
