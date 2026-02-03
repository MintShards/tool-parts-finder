/**
 * Tab management utility for opening vendor search results.
 */

export const openSingleTab = (url) => {
  if (!url) {
    console.warn('No URL provided');
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
};
