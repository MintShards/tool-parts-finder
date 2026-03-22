import { useState, useEffect } from 'react';
import { Star, Trash2, Plus } from 'lucide-react';
import { storage } from '../services/storage';
import ExportImportButtons from './ExportImportButtons';

const FavoritesList = ({ onSelectFavorite, currentQuery }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    try {
      setLoading(true);
      const data = storage.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = () => {
    if (!currentQuery) return;

    try {
      const description = prompt('Enter a description for this favorite:', currentQuery);
      if (!description) return;

      const newFavorite = storage.addFavorite(description, currentQuery);
      if (newFavorite) {
        loadFavorites();
      } else {
        alert('This part is already in your favorites!');
      }
    } catch (error) {
      console.error('Failed to add favorite:', error);
      alert('Failed to add favorite');
    }
  };

  const handleDeleteFavorite = (favoriteId, e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this favorite?')) return;

    try {
      storage.deleteFavorite(favoriteId);
      setFavorites(favorites.filter(f => f.id !== favoriteId));
    } catch (error) {
      console.error('Failed to delete favorite:', error);
    }
  };

  const handleIncrementOrder = (favoriteId, e) => {
    e.stopPropagation();

    try {
      const updated = storage.incrementOrderCount(favoriteId);
      if (updated) {
        setFavorites(favorites.map(f => f.id === favoriteId ? updated : f));
      }
    } catch (error) {
      console.error('Failed to increment order count:', error);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Star className="w-4 h-4 fill-scarlet text-scarlet" />
          Favorites
        </h2>
        <div className="flex items-center gap-2">
          {favorites.length > 0 && <ExportImportButtons />}
          {currentQuery && (
            <button
              onClick={handleAddFavorite}
              className="text-xs text-scarlet hover:text-scarlet-hover flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Current
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : favorites.length === 0 ? (
        <p className="text-sm text-gray-500">No favorites yet. Star parts you order frequently!</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {favorites.map((favorite) => (
            <button
              key={favorite.id}
              onClick={() => onSelectFavorite(favorite.search_query)}
              className="group inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-scarlet hover:text-white rounded-full text-sm transition-all"
            >
              <Star className="w-3 h-3 fill-current" />
              <span className="font-medium">{favorite.part_description}</span>
              {favorite.times_ordered > 0 && (
                <span className="text-xs opacity-75">({favorite.times_ordered}x)</span>
              )}
              <button
                onClick={(e) => handleDeleteFavorite(favorite.id, e)}
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesList;
