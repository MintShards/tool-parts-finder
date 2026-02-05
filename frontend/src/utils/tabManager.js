/**
 * Tab management utility for opening vendor search results.
 */

export const openSingleTab = (url) => {
  if (!url) {
    console.warn('No URL provided');
    return;
  }

  // Try window.open first
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');

  // Fallback for Chrome pop-up blocker
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    // If blocked, create a link and click it
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
