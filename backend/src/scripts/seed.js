require('dotenv').config();
const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');
const AppSettings = require('../models/AppSettings');
const Category = require('../models/Category');
const Channel = require('../models/Channel');
const logger = require('../utils/logger');

const defaultCategories = [
  'Antibiotics',
  'Pain Relief',
  'Vitamins & Supplements',
  'Diabetes',
  'Cardiovascular',
  'Respiratory',
  'Dermatology',
  'Gastrointestinal',
  'Other',
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB for seeding');

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await AdminUser.findOne({ username });
    if (!existingAdmin) {
      await AdminUser.create({ username, password, role: 'superadmin' });
      logger.info(`Admin user created: ${username}`);
    } else {
      logger.info('Admin user already exists');
    }

    await AppSettings.findOneAndUpdate(
      { key: 'default' },
      {
        botDisplayName: process.env.TELEGRAM_BOT_DISPLAY_NAME || 'PharmaBot',
        botUsername: String(process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, ''),
        cbeAccountNumber: process.env.CBE_ACCOUNT_NUMBER || '1000262694392',
        telebirrPhone: process.env.TELEBIRR_PHONE || '0993676861',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    logger.info('App settings seeded');

    for (const name of defaultCategories) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
      await Category.findOneAndUpdate(
        { slug },
        { name, slug },
        { upsert: true, new: true }
      );
    }
    logger.info('Categories seeded');

    if (process.env.TELEGRAM_CHANNEL_ID) {
      await Channel.findOneAndUpdate(
        { telegramChannelId: process.env.TELEGRAM_CHANNEL_ID },
        {
          name: 'Main Channel',
          telegramChannelId: process.env.TELEGRAM_CHANNEL_ID,
          description: 'Imported from TELEGRAM_CHANNEL_ID',
          isActive: true,
          isDefault: true,
        },
        { upsert: true, new: true }
      );
      logger.info('Default channel seeded from TELEGRAM_CHANNEL_ID');
    }

    logger.info('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

seed();
