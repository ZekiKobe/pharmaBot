require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { createBot, setupMenuButton } = require('./bot');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const bot = createBot();
  if (bot) {
    bot.launch().then(async () => {
      logger.info('Telegram bot started');
      await setupMenuButton(bot);
    });
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  }

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

start();
