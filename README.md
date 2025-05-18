# Star-Gazer Analysis

> **CHECKPOINT VERSION**: This repository represents a working checkpoint of the Star-Gazer Analysis project. While functional, it has known performance limitations and the AI analysis component needs further refinement.

An AI-powered Google Maps review analysis application for three businesses (The Little Prince Cafe, Vol de Nuit The Hidden Bar, and L'Envol Art Space), providing sentiment analysis and strategic recommendations.

## Current Status

- ✅ Core review analysis features implemented
- ✅ Dual AI recommendation system:
  - Browser-based (Transformers.js): Fast, privacy-focused
  - Cloud-based (OpenAI GPT-4): Advanced analysis
- ✅ Daily automated review collection via n8n integration
- ✅ Basic data export functionality
- ⚠️ Performance is slow with larger datasets
- ⚠️ AI analysis quality needs improvement

## Architecture

### Frontend Structure
- `/src/components` - React components
- `/src/hooks` - Custom React hooks
- `/src/services` - API and service layers
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions

### Backend Structure
- Supabase PostgreSQL database
- Edge Functions for AI processing
- n8n automation for daily review updates

### Data Flow
1. n8n fetches reviews daily from Google Maps
2. Data stored in Supabase tables (one per business)
3. Frontend fetches and analyzes data
4. AI generates recommendations on-demand
5. Results can be exported or emailed (email feature pending)

## Business Types
- CAFE: The Little Prince Cafe
- BAR: Vol de Nuit The Hidden Bar
- GALLERY: L'Envol Art Space

## Review Analysis Features
1. Sentiment analysis
2. Theme extraction
3. Staff performance tracking
4. Trend identification
5. Competitive benchmarking

## Development Setup

```bash
git clone https://github.com/Arthurkhan/star-gazer-analysis-checkpoint.git
cd star-gazer-analysis-checkpoint
npm install

# Environment Variables (.env.local)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key (for testing)

# Run Development Server
npm run dev

# Build for Production
npm run build
```

## Future Roadmap

### Phase 1: Core Completion (Current)
- [x] Basic review analysis
- [x] AI recommendations
- [ ] Email notifications
- [ ] Improved exports
- [ ] Period comparisons

### Phase 2: Enhanced Analytics
- [ ] Custom dashboard widgets
- [ ] Advanced filtering options
- [ ] Predictive analytics
- [ ] Competitor tracking

### Phase 3: User Features
- [ ] User API key management
- [ ] Multi-user support
- [ ] Role-based access
- [ ] Custom AI providers

### Phase 4: Scaling
- [ ] Performance optimization
- [ ] Caching strategies
- [ ] Mobile responsive design
- [ ] API rate limiting

### Phase 5: Mobile & External
- [ ] Mobile app development
- [ ] External integrations
- [ ] Webhook support
- [ ] Public API

## Tech Stack
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Supabase (PostgreSQL + Edge Functions)
- AI: Transformers.js (browser) + OpenAI API (cloud)
- Automation: n8n workflow for daily data updates