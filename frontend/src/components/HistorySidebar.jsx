import { useState, useEffect } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { getSearchHistory, clearSearchHistory } from '../services/api';

const HistorySidebar = ({ onSelectHistory }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getSearchHistory(20);
      setHistory(data.history || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all search history?')) return;

    try {
      await clearSearchHistory();
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hr ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Searches
        </h2>
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-gray-500 hover:text-scarlet transition-colors"
            title="Clear history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-gray-500">No recent searches</p>
      ) : (
        <div className="space-y-2">
          {history.map((item, index) => (
            <button
              key={index}
              onClick={() => onSelectHistory(item.query)}
              className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-scarlet hover:bg-scarlet-light hover:bg-opacity-5 transition-all group"
            >
              <p className="text-sm font-medium text-gray-900 group-hover:text-scarlet truncate">
                {item.query}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatTimestamp(item.timestamp)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorySidebar;
