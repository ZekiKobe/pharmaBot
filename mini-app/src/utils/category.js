export function formatCategoryLabel(slug) {
  if (!slug) return '';
  return String(slug)
    .replace(/-/g, ' ')
    .replace(/\band\b/gi, '&')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
