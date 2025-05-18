# Contributing to Star-Gazer Analysis

Thank you for considering contributing to Star-Gazer Analysis! This is a checkpoint version with known limitations, and we welcome contributions to help improve it.

## Current Limitations

- **Performance Issues**: The application is slow with larger datasets.
- **AI Analysis Quality**: The AI recommendations need significant improvement.
- **Incomplete Features**: Email notifications and enhanced exports are not yet implemented.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Arthurkhan/star-gazer-analysis-checkpoint.git
   cd star-gazer-analysis-checkpoint
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on `.env.example` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Priority Areas for Improvement

1. **Performance Optimization**:
   - Implement pagination for large datasets
   - Add data caching strategy
   - Optimize AI processing

2. **AI Recommendation Quality**:
   - Improve prompt engineering
   - Enhance theme extraction accuracy
   - Add more context to recommendations

3. **Feature Completion**:
   - Implement email notification system
   - Create styled PDF exports
   - Add period comparison feature

## Project Structure

- `/src/components` - React components
- `/src/hooks` - Custom React hooks
- `/src/services` - API and service layers
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions
- `/supabase` - Supabase Edge Functions

## Commit Guidelines

Please follow these guidelines for commit messages:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools

Example: `feat: add email notification service`

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes with descriptive commit messages
4. Push to your branch (`git push origin feature/my-feature`)
5. Open a Pull Request

Thank you for contributing to Star-Gazer Analysis!
