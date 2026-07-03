require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { createBot } = require('./bot');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const bot = createBot();
  if (bot) {
    bot.launch().then(() => logger.info('Telegram bot started'));
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  }

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

start();
