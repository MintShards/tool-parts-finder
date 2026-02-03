import { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Makita DTD152 brush, dewalt switch, CB-440, grinder bearing..."
            className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-scarlet focus:ring-2 focus:ring-scarlet focus:ring-opacity-20 transition-all"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-8 py-4 bg-scarlet text-white text-lg font-medium rounded-lg hover:bg-scarlet-hover focus:outline-none focus:ring-2 focus:ring-scarlet focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Try: "makita brush", "Dewalt DWE402 switch", "impact driver trigger", or part numbers like "CB-440"
      </p>
    </form>
  );
};

export default SearchBar;
