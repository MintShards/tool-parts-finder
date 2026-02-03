import { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import HistorySidebar from './components/HistorySidebar';
import FavoritesList from './components/FavoritesList';
import { searchParts } from './services/api';

function App() {
  const [searchResults, setSearchResults] = useState(null);
  const [parsedQuery, setParsedQuery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentQuery(query);

      const data = await searchParts(query);

      setSearchResults(data.results);
      setParsedQuery(data.parsed);

    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (query) => {
    handleSearch(query);
  };

  const handleSelectFavorite = (query) => {
    handleSearch(query);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* History Sidebar */}
      <div className="w-80 hidden lg:block">
        <HistorySidebar onSelectHistory={handleSelectHistory} />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Wrench className="w-8 h-8 text-scarlet" />
              <h1 className="text-3xl font-bold text-gray-900">Tool Parts Finder</h1>
            </div>
            <p className="text-sm text-gray-600">
              Search for pneumatic tool parts across multiple vendors instantly
            </p>
          </div>
        </header>

        {/* Search Section */}
        <main className="px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Favorites */}
            <FavoritesList
              onSelectFavorite={handleSelectFavorite}
              currentQuery={currentQuery}
            />

            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} loading={loading} />

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Search Results */}
            {searchResults && (
              <SearchResults results={searchResults} parsed={parsedQuery} />
            )}

            {/* Instructions */}
            {!searchResults && !loading && (
              <div className="mt-12 max-w-3xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">How it works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-scarlet text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                      1
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Enter Part Details</h3>
                    <p className="text-sm text-gray-600">
                      Type brand, model, and part description
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-scarlet text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                      2
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Search All Vendors</h3>
                    <p className="text-sm text-gray-600">
                      Instantly search eBay Canada and Amazon Canada
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-scarlet text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                      3
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Open Vendor Sites</h3>
                    <p className="text-sm text-gray-600">
                      Click "Open in New Tab" to visit vendor sites and order
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">💡 Pro Tip</h3>
                  <p className="text-sm text-gray-700">
                    Star frequently ordered parts as favorites for quick access. Use search history
                    to repeat recent searches instantly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 px-8 py-6 mt-12">
          <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
            <p>Tool Parts Finder - Pneumatic Tool Repair Solutions</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
