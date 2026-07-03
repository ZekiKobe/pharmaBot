const Channel = require('../models/Channel');

const listChannels = async (_req, res, next) => {
  try {
    const channels = await Channel.find().sort({ isDefault: -1, name: 1 });
    res.json({ success: true, data: channels });
  } catch (error) {
    next(error);
  }
};

const createChannel = async (req, res, next) => {
  try {
    const { name, telegramChannelId, description, isActive, isDefault } = req.body;

    if (!name?.trim() || !telegramChannelId?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name and Telegram channel ID are required',
        fieldErrors: {
          ...(!name?.trim() && { name: 'Name is required' }),
          ...(!telegramChannelId?.trim() && { telegramChannelId: 'Channel ID is required' }),
        },
      });
    }

    if (isDefault) {
      await Channel.updateMany({}, { isDefault: false });
    }

    const channel = await Channel.create({
      name: name.trim(),
      telegramChannelId: telegramChannelId.trim(),
      description: description?.trim() || '',
      isActive: isActive !== false,
      isDefault: Boolean(isDefault),
    });

    res.status(201).json({ success: true, data: channel, message: 'Channel added' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This Telegram channel ID is already registered' });
    }
    next(error);
  }
};

const updateChannel = async (req, res, next) => {
  try {
    const { name, telegramChannelId, description, isActive, isDefault } = req.body;

    if (isDefault) {
      await Channel.updateMany({ _id: { $ne: req.params.id } }, { isDefault: false });
    }

    const channel = await Channel.findByIdAndUpdate(
      req.params.id,
      {
        ...(name !== undefined && { name: name.trim() }),
        ...(telegramChannelId !== undefined && { telegramChannelId: telegramChannelId.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
      },
      { new: true, runValidators: true }
    );

    if (!channel) {
      return res.status(404).json({ success: false, message: 'Channel not found' });
    }

    res.json({ success: true, data: channel, message: 'Channel updated' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This Telegram channel ID is already registered' });
    }
    next(error);
  }
};

const deleteChannel = async (req, res, next) => {
  try {
    const channel = await Channel.findByIdAndDelete(req.params.id);
    if (!channel) {
      return res.status(404).json({ success: false, message: 'Channel not found' });
    }
    res.json({ success: true, message: 'Channel removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listChannels,
  createChannel,
  updateChannel,
  deleteChannel,
};
