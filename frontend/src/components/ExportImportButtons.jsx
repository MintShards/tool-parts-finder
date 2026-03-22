import { Download, Upload } from 'lucide-react';
import { storage } from '../services/storage';

const ExportImportButtons = () => {
  const handleExport = () => {
    try {
      const jsonData = storage.exportFavorites();
      if (!jsonData) {
        alert('No favorites to export');
        return;
      }

      // Create download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tool-parts-favorites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Favorites exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export favorites');
    }
  };

  const handleImport = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const jsonData = event.target.result;
            const success = storage.importFavorites(jsonData, true); // merge=true

            if (success) {
              alert('Favorites imported successfully! Refresh to see changes.');
              window.location.reload();
            } else {
              alert('Import failed. Please check the file format.');
            }
          } catch (error) {
            console.error('Import failed:', error);
            alert('Failed to import favorites. Invalid file format.');
          }
        };

        reader.readAsText(file);
      };

      input.click();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import favorites');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExport}
        className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-scarlet bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        title="Export favorites to JSON file"
      >
        <Download className="w-3 h-3" />
        Export
      </button>
      <button
        onClick={handleImport}
        className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-scarlet bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        title="Import favorites from JSON file"
      >
        <Upload className="w-3 h-3" />
        Import
      </button>
    </div>
  );
};

export default ExportImportButtons;
