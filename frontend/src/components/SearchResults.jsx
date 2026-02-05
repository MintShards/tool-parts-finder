import { ExternalLink, CheckCircle, Clock, Layers, AlertCircle, X } from 'lucide-react';
import { openSingleTab } from '../utils/tabManager';
import { useState } from 'react';

const SearchResults = ({ results, parsed }) => {
  const [showPopupHelp, setShowPopupHelp] = useState(false);

  if (!results || results.length === 0) {
    return null;
  }

  const handleOpenAll = () => {
    // Try to open all tabs immediately
    let successCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'ready') {
        const newTab = window.open(result.url, `_blank_${index}`);
        if (newTab) successCount++;
      }
    });

    // Show help if blocked
    if (successCount < results.length) {
      setTimeout(() => {
        setShowPopupHelp(true);
      }, 500);
    }
  };

  return (
    <div className="mt-8">
      {/* Pop-up Help Modal */}
      {showPopupHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-scarlet" />
                <h3 className="text-lg font-semibold">Pop-ups Blocked</h3>
              </div>
              <button onClick={() => setShowPopupHelp(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <p className="font-medium">To open all {results.length} tabs, allow pop-ups:</p>

              <div className="bg-gray-50 p-4 rounded space-y-2">
                <p className="font-medium text-gray-900">Chrome:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click the 🚫 icon in the address bar</li>
                  <li>Select "Always allow pop-ups"</li>
                  <li>Click "Open All" button again</li>
                </ol>
              </div>

              <p className="text-xs text-gray-500">
                Or click each vendor individually below to open one at a time.
              </p>
            </div>

            <button
              onClick={() => setShowPopupHelp(false)}
              className="mt-4 w-full px-4 py-2 bg-scarlet text-white font-medium rounded-lg hover:bg-scarlet-hover"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Search Results</h2>
          {parsed && (
            <p className="text-sm text-gray-600 mt-1">
              {parsed.brand && <span className="font-medium">{parsed.brand}</span>}
              {parsed.model && <span className="ml-2">{parsed.model}</span>}
              {parsed.part && <span className="ml-2 text-gray-700">→ {parsed.part}</span>}
            </p>
          )}
        </div>

        <button
          onClick={handleOpenAll}
          className="flex items-center gap-2 px-6 py-3 bg-scarlet text-white font-medium rounded-lg hover:bg-scarlet-hover focus:outline-none focus:ring-2 focus:ring-scarlet focus:ring-offset-2 transition-all shadow-lg"
        >
          <Layers className="w-5 h-5" />
          <span>Open All ({results.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => (
          <VendorCard key={index} result={result} />
        ))}
      </div>
    </div>
  );
};

const VendorCard = ({ result }) => {
  const handleOpenTab = () => {
    openSingleTab(result.url);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{result.vendor}</h3>
          <div className="flex items-center gap-2 mt-1">
            {result.status === 'ready' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-500" />
            )}
            <span className="text-xs text-gray-500 capitalize">
              {result.method}
            </span>
          </div>
        </div>
        {result.logo_url && (
          <img
            src={result.logo_url}
            alt={result.vendor}
            className="h-8 object-contain"
          />
        )}
      </div>

      {result.pricing && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Price Range</p>
          <p className="text-lg font-semibold text-gray-900">
            ${result.pricing.min.toFixed(2)} - ${result.pricing.max.toFixed(2)}
          </p>
        </div>
      )}

      <button
        onClick={handleOpenTab}
        disabled={result.status !== 'ready'}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-scarlet text-white font-medium rounded-lg hover:bg-scarlet-hover focus:outline-none focus:ring-2 focus:ring-scarlet focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <span>Open in New Tab</span>
        <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SearchResults;
