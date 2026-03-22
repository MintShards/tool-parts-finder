/**
 * Tab management utility for opening vendor search results.
 */

export const openSingleTab = (url) => {
  if (!url) return;

  // Open in new tab - browsers handle this reliably for user clicks
  window.open(url, '_blank', 'noopener,noreferrer');
};
