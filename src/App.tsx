import React from 'react';
import RecommendationsDashboard from '@/components/recommendations/RecommendationsDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              <span className="text-indigo-600">Star</span>Gazer Analysis
            </h1>
            <span className="ml-2 text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
              Checkpoint
            </span>
          </div>
          <div className="text-sm text-gray-500">
            AI-Powered Review Analysis
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="py-6 px-4">
        <RecommendationsDashboard />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <p>Star-Gazer Analysis &copy; 2025 | Checkpoint Version</p>
          <p className="mt-1 text-xs">
            This is a checkpoint version with known performance limitations.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
