require('dotenv').config();
const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');
const Category = require('../models/Category');
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

    for (const name of defaultCategories) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
      await Category.findOneAndUpdate(
        { slug },
        { name, slug },
        { upsert: true, new: true }
      );
    }
    logger.info('Categories seeded');

    logger.info('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

seed();
