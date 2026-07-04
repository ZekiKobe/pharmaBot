const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const getDisplayName = (settings) => settings?.botDisplayName || 'PharmaBot';
const getBotUsername = (settings) => String(settings?.botUsername || '').replace(/^@/, '');

const postTitle = (post) => {
  if (post.type === 'seller') {
    return '💊 <b>Medicine for Sale</b>';
  }
  return '🔎 <b>Wanted to Buy</b>';
};

const postSubtitle = (post) => {
  if (post.type === 'seller') {
    return '<i>Seller listing from Ethiopian Pharma Marketplace</i>';
  }
  return '<i>Buyer request from Ethiopian Pharma Marketplace</i>';
};

const buildFooter = (settings) => {
  const botUsername = getBotUsername(settings);
  const botLine = botUsername
    ? `<a href="https://t.me/${escapeHtml(botUsername)}">@${escapeHtml(botUsername)}</a>`
    : escapeHtml(getDisplayName(settings));

  return `📲 <i>Post or find medicines via ${botLine}</i>`;
};

const formatUsername = (username) => {
  if (!username) return '—';
  const clean = String(username).replace('@', '');
  return `<a href="https://t.me/${escapeHtml(clean)}">@${escapeHtml(clean)}</a>`;
};

const formatMedicineTitle = (post) => {
  const name = escapeHtml(post.medicineName);
  const strength = post.strength ? ` <i>${escapeHtml(post.strength)}</i>` : '';
  return `<b>${name}</b>${strength}`;
};

const detailLine = (label, value) => (value ? `• <b>${label}:</b> ${value}` : null);

const formatContactBlock = (post, roleLabel) =>
  `📞 <b>Contact ${roleLabel}</b>\n` +
  `${detailLine('Telegram', formatUsername(post.telegramUsername))}\n` +
  `${detailLine('Phone', `<code>${escapeHtml(post.contactPhone)}</code>`)}`;

const formatDescriptionBlock = (post) =>
  post.description
    ? `📝 <b>Details</b>\n${escapeHtml(post.description)}`
    : null;

const formatCategoryLabel = (slug) =>
  String(slug)
    .replace(/-/g, ' ')
    .replace(/\band\b/gi, '&')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatSellerPost = (post, settings) => {
  const parts = [
    postTitle(post),
    postSubtitle(post),
    '',
    formatMedicineTitle(post),
    '',
    '📦 <b>Listing Details</b>',
    detailLine('Brand', escapeHtml(post.brand)),
    post.category ? detailLine('Category', escapeHtml(formatCategoryLabel(post.category))) : null,
    detailLine('Quantity', escapeHtml(post.quantity)),
    post.price != null && post.price !== '' ? detailLine('Price', `<b>ETB ${escapeHtml(post.price)}</b>`) : null,
    detailLine('City', escapeHtml(post.city)),
    post.expiryDate
      ? detailLine('Expiry', escapeHtml(new Date(post.expiryDate).toLocaleDateString('en-ET')))
      : null,
    formatDescriptionBlock(post),
    '',
    formatContactBlock(post, 'Seller'),
    '',
    buildFooter(settings),
  ];

  return parts.filter((line) => line !== null).join('\n');
};

const formatBuyerPost = (post, settings) => {
  const parts = [
    postTitle(post),
    postSubtitle(post),
    '',
    formatMedicineTitle(post),
    '',
    '🛒 <b>Request Details</b>',
    detailLine('Quantity Needed', escapeHtml(post.quantity)),
    detailLine('City', escapeHtml(post.city)),
    formatDescriptionBlock(post),
    '',
    formatContactBlock(post, 'Buyer'),
    '',
    buildFooter(settings),
  ];

  return parts.filter((line) => line !== null).join('\n');
};

const formatChannelMessage = (post, settings) =>
  post.type === 'seller' ? formatSellerPost(post, settings) : formatBuyerPost(post, settings);

module.exports = {
  escapeHtml,
  formatChannelMessage,
  formatSellerPost,
  formatBuyerPost,
};
