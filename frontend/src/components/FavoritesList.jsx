import { useState, useEffect } from 'react';
import { Star, Trash2, Plus } from 'lucide-react';
import { getFavorites, createFavorite, deleteFavorite, incrementOrderCount } from '../services/api';

const FavoritesList = ({ onSelectFavorite, currentQuery }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavorites();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!currentQuery) return;

    try {
      const description = prompt('Enter a description for this favorite:', currentQuery);
      if (!description) return;

      await createFavorite(description, currentQuery);
      await loadFavorites();
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add favorite:', error);
      alert('Failed to add favorite');
    }
  };

  const handleDeleteFavorite = async (favoriteId, e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this favorite?')) return;

    try {
      await deleteFavorite(favoriteId);
      setFavorites(favorites.filter(f => f._id !== favoriteId));
    } catch (error) {
      console.error('Failed to delete favorite:', error);
    }
  };

  const handleIncrementOrder = async (favoriteId, e) => {
    e.stopPropagation();

    try {
      const updated = await incrementOrderCount(favoriteId);
      setFavorites(favorites.map(f => f._id === favoriteId ? updated : f));
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

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : favorites.length === 0 ? (
        <p className="text-sm text-gray-500">No favorites yet. Star parts you order frequently!</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {favorites.map((favorite) => (
            <button
              key={favorite._id}
              onClick={() => onSelectFavorite(favorite.search_query)}
              className="group inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-scarlet hover:text-white rounded-full text-sm transition-all"
            >
              <Star className="w-3 h-3 fill-current" />
              <span className="font-medium">{favorite.part_description}</span>
              {favorite.times_ordered > 0 && (
                <span className="text-xs opacity-75">({favorite.times_ordered}x)</span>
              )}
              <button
                onClick={(e) => handleDeleteFavorite(favorite._id, e)}
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
