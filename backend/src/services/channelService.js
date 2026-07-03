const Channel = require('../models/Channel');
const { formatChannelMessage } = require('./telegramService');
const logger = require('../utils/logger');

const getActiveChannels = async () => {
  const channels = await Channel.find({ isActive: true }).sort({ isDefault: -1, name: 1 });
  if (channels.length) return channels;

  if (process.env.TELEGRAM_CHANNEL_ID) {
    return [
      {
        _id: null,
        name: 'Env channel',
        telegramChannelId: process.env.TELEGRAM_CHANNEL_ID,
        isActive: true,
        isDefault: true,
      },
    ];
  }

  return [];
};

const publishPostToChannels = async (post, bot) => {
  if (!bot) {
    logger.warn('Bot not available; skipping channel publish');
    return [];
  }

  const channels = await getActiveChannels();
  if (!channels.length) {
    logger.warn('No active channels configured');
    return [];
  }

  const message = formatChannelMessage(post);
  const published = [];

  for (const channel of channels) {
    try {
      const sent = await bot.telegram.sendMessage(channel.telegramChannelId, message, {
        parse_mode: 'Markdown',
      });
      published.push({
        channelId: channel._id || undefined,
        channelName: channel.name,
        telegramChannelId: channel.telegramChannelId,
        messageId: String(sent.message_id),
      });
      logger.info(`Published post ${post._id} to ${channel.name}`);
    } catch (err) {
      logger.error(`Failed to publish to ${channel.name}: ${err.message}`);
    }
  }

  if (!published.length) {
    throw new Error('Failed to publish to any Telegram channel. Check channel IDs and bot permissions.');
  }

  return published;
};

module.exports = {
  getActiveChannels,
  publishPostToChannels,
};
