let botInstance = null;

const setBot = (bot) => {
  botInstance = bot;
};

const getBot = () => botInstance;

module.exports = { setBot, getBot };
