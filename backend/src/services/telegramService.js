const formatSellerPost = (post) => {
  const username = post.telegramUsername ? `@${post.telegramUsername.replace('@', '')}` : 'N/A';
  return (
    `💊 *Medicine:* ${post.medicineName}\n\n` +
    `*Brand:* ${post.brand || 'N/A'}\n\n` +
    `*Strength:* ${post.strength || 'N/A'}\n\n` +
    `*Quantity:* ${post.quantity}\n\n` +
    `*Price:* ETB ${post.price}\n\n` +
    `*City:* ${post.city}\n\n` +
    `*Contact:*\n${username}\n${post.contactPhone}`
  );
};

const formatBuyerPost = (post) => {
  const username = post.telegramUsername ? `@${post.telegramUsername.replace('@', '')}` : 'N/A';
  const medicineLine = post.strength
    ? `${post.medicineName} ${post.strength}`
    : post.medicineName;
  return (
    `🔍 *Looking For:*\n${medicineLine}\n\n` +
    `*Quantity:*\n${post.quantity}\n\n` +
    `*City:*\n${post.city}\n\n` +
    `*Contact:*\n${username}\n${post.contactPhone}`
  );
};

const formatChannelMessage = (post) => {
  return post.type === 'seller' ? formatSellerPost(post) : formatBuyerPost(post);
};

module.exports = { formatChannelMessage, formatSellerPost, formatBuyerPost };
