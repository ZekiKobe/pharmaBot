const BOT_DISPLAY_NAME = process.env.TELEGRAM_BOT_DISPLAY_NAME || 'PharmaBot';
const BOT_USERNAME = (process.env.TELEGRAM_BOT_USERNAME || '').replace('@', '');

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const divider = '━━━━━━━━━━━━━━━━━━━━━━';

const typeBadge = (post) => {
  if (post.type === 'seller') {
    return '🟢 <b>FOR SALE</b>  ·  Medicine listed';
  }
  return '🔵 <b>BUYER REQUEST</b>  ·  Looking for medicine';
};

const buildHeader = () =>
  `${divider}\n` +
  `💊 <b>${escapeHtml(BOT_DISPLAY_NAME)}</b>\n` +
  `<i>Ethiopian Pharma Marketplace</i>\n` +
  `${divider}`;

const buildFooter = () => {
  const botLine = BOT_USERNAME
    ? `<a href="https://t.me/${escapeHtml(BOT_USERNAME)}">@${escapeHtml(BOT_USERNAME)}</a>`
    : escapeHtml(BOT_DISPLAY_NAME);

  return (
    `\n${divider}\n` +
    `📲 <i>List or find medicines via ${botLine}</i>`
  );
};

const formatUsername = (username) => {
  if (!username) return '—';
  const clean = String(username).replace('@', '');
  return `<a href="https://t.me/${escapeHtml(clean)}">@${escapeHtml(clean)}</a>`;
};

const formatMedicineTitle = (post) => {
  const name = escapeHtml(post.medicineName);
  const strength = post.strength ? ` <i>${escapeHtml(post.strength)}</i>` : '';
  return `💊 <b>${name}</b>${strength}`;
};

const formatContactBlock = (post) =>
  `📞 <b>Contact</b>\n` +
  `   ${formatUsername(post.telegramUsername)}\n` +
  `   <code>${escapeHtml(post.contactPhone)}</code>`;

const formatSellerPost = (post) => {
  const parts = [
    buildHeader(),
    '',
    typeBadge(post),
    '',
    formatMedicineTitle(post),
    post.brand ? `🏷 <b>Brand</b>     ${escapeHtml(post.brand)}` : null,
    `📦 <b>Quantity</b>  ${escapeHtml(post.quantity)}`,
    post.price != null && post.price !== ''
      ? `💰 <b>Price</b>      <b>ETB ${escapeHtml(post.price)}</b>`
      : null,
    `📍 <b>City</b>       ${escapeHtml(post.city)}`,
    post.expiryDate
      ? `📅 <b>Expiry</b>    ${escapeHtml(new Date(post.expiryDate).toLocaleDateString('en-ET'))}`
      : null,
    post.description ? `\n📝 <i>${escapeHtml(post.description)}</i>` : null,
    '',
    formatContactBlock(post),
    buildFooter(),
  ];

  return parts.filter((line) => line !== null).join('\n');
};

const formatBuyerPost = (post) => {
  const parts = [
    buildHeader(),
    '',
    typeBadge(post),
    '',
    formatMedicineTitle(post),
    `📦 <b>Quantity</b>  ${escapeHtml(post.quantity)}`,
    `📍 <b>City</b>       ${escapeHtml(post.city)}`,
    post.description ? `\n📝 <i>${escapeHtml(post.description)}</i>` : null,
    '',
    formatContactBlock(post),
    buildFooter(),
  ];

  return parts.filter((line) => line !== null).join('\n');
};

const formatChannelMessage = (post) =>
  post.type === 'seller' ? formatSellerPost(post) : formatBuyerPost(post);

module.exports = {
  escapeHtml,
  formatChannelMessage,
  formatSellerPost,
  formatBuyerPost,
};
