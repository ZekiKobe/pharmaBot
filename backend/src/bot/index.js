const { Telegraf, Markup, session } = require('telegraf');
const { setBot } = require('./botInstance');
const Post = require('../models/Post');
const User = require('../models/User');
const { approvePost, rejectPost, getPaymentInfo } = require('../services/postService');
const logger = require('../utils/logger');

const pendingRejectState = new Map();

const isAdmin = (telegramId) => {
  const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map((id) => id.trim());
  return adminIds.includes(String(telegramId));
};

const createBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    logger.warn('TELEGRAM_BOT_TOKEN not set. Bot will not start.');
    return null;
  }

  const bot = new Telegraf(token);
  bot.use(session());

  bot.start(async (ctx) => {
    const user = ctx.from;
    await User.findOneAndUpdate(
      { telegramId: String(user.id) },
      {
        telegramId: String(user.id),
        username: user.username,
        fullName: [user.first_name, user.last_name].filter(Boolean).join(' '),
      },
      { upsert: true, new: true }
    );

    const miniAppUrl = process.env.MINI_APP_URL || 'https://example.com';
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.webApp('🛒 Open Marketplace', miniAppUrl)],
      [Markup.button.callback('💳 Payment Info', 'payment_info')],
      [Markup.button.callback('📋 My Posts Status', 'my_posts')],
      [Markup.button.callback('📞 Contact Admin', 'contact_admin')],
    ]);

    await ctx.reply(
      `Welcome to *PharmaBot* 💊\n\n` +
        `Ethiopia's pharmaceutical marketplace on Telegram.\n\n` +
        `• Create buyer requests\n` +
        `• List medicines for sale\n` +
        `• Browse latest posts\n\n` +
        `Each post costs *ETB ${process.env.POST_PRICE || 20}*.`,
      { parse_mode: 'Markdown', ...keyboard }
    );
  });

  bot.command('app', async (ctx) => {
    const miniAppUrl = process.env.MINI_APP_URL || 'https://example.com';
    await ctx.reply('Open the marketplace:', Markup.inlineKeyboard([
      Markup.button.webApp('🛒 Open Mini App', miniAppUrl),
    ]));
  });

  bot.action('payment_info', async (ctx) => {
    const info = getPaymentInfo();
    await ctx.answerCbQuery();
    await ctx.reply(
      `💳 *Payment Instructions*\n\n` +
        `Post fee: *ETB ${info.amount}*\n\n` +
        `*CBE Account:*\n\`${info.cbeAccountNumber}\`\n\n` +
        `*Telebirr:*\n\`${info.telebirrPhone}\`\n\n` +
        `After payment, upload your screenshot in the Mini App.`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.action('my_posts', async (ctx) => {
    await ctx.answerCbQuery();
    const user = await User.findOne({ telegramId: String(ctx.from.id) });
    if (!user) {
      return ctx.reply('You have no posts yet. Create one in the Mini App!');
    }

    const posts = await Post.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10);
    if (!posts.length) {
      return ctx.reply('You have no posts yet. Create one in the Mini App!');
    }

    const statusEmoji = { draft: '📝', pending: '⏳', approved: '✅', rejected: '❌' };
    const lines = posts.map(
      (p) =>
        `${statusEmoji[p.approvalStatus] || '•'} *${p.medicineName}* (${p.type})\n` +
        `Status: ${p.approvalStatus}`
    );

    await ctx.reply(lines.join('\n\n'), { parse_mode: 'Markdown' });
  });

  bot.action('contact_admin', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      '📞 Contact the admin:\n\nSend your question here and we will respond shortly.\n\nAdmin: @pharmabot_admin'
    );
  });

  bot.command('pending', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      return ctx.reply('⛔ Unauthorized. Admin only command.');
    }

    const posts = await Post.find({ approvalStatus: 'pending' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'username fullName');

    if (!posts.length) {
      return ctx.reply('✅ No pending posts.');
    }

    for (const post of posts) {
      const typeLabel = post.type === 'buyer' ? '🔍 Buyer Request' : '💊 Seller Listing';
      const text =
        `${typeLabel}\n\n` +
        `*Medicine:* ${post.medicineName}\n` +
        `*City:* ${post.city}\n` +
        `*Quantity:* ${post.quantity}\n` +
        (post.price ? `*Price:* ETB ${post.price}\n` : '') +
        `*Submitted:* ${post.createdAt.toLocaleString()}`;

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback('✅ Approve', `approve_${post._id}`),
          Markup.button.callback('❌ Reject', `reject_${post._id}`),
        ],
      ]);

      if (post.paymentScreenshot) {
        const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        try {
          await ctx.replyWithPhoto(`${baseUrl}${post.paymentScreenshot}`, {
            caption: text,
            parse_mode: 'Markdown',
            ...keyboard,
          });
        } catch {
          await ctx.reply(text, { parse_mode: 'Markdown', ...keyboard });
        }
      } else {
        await ctx.reply(text, { parse_mode: 'Markdown', ...keyboard });
      }
    }
  });

  bot.action(/^approve_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery('Unauthorized');
    }

    const postId = ctx.match[1];
    try {
      await approvePost(postId, null);
      await ctx.answerCbQuery('Approved!');
      await ctx.editMessageCaption?.(
        (ctx.callbackQuery.message.caption || '') + '\n\n✅ *APPROVED*',
        { parse_mode: 'Markdown' }
      ).catch(() =>
        ctx.editMessageText(
          (ctx.callbackQuery.message.text || '') + '\n\n✅ *APPROVED*',
          { parse_mode: 'Markdown' }
        )
      );
    } catch (err) {
      await ctx.answerCbQuery(`Error: ${err.message}`);
    }
  });

  bot.action(/^reject_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery('Unauthorized');
    }

    const postId = ctx.match[1];
    pendingRejectState.set(ctx.from.id, postId);
    await ctx.answerCbQuery();
    await ctx.reply('Please send the rejection reason for this post:');
  });

  bot.on('text', async (ctx, next) => {
    const postId = pendingRejectState.get(ctx.from.id);
    if (postId && isAdmin(ctx.from.id)) {
      pendingRejectState.delete(ctx.from.id);
      try {
        await rejectPost(postId, ctx.message.text, null);
        await ctx.reply('❌ Post rejected and user notified.');
      } catch (err) {
        await ctx.reply(`Error: ${err.message}`);
      }
      return;
    }
    return next();
  });

  bot.catch((err) => {
    logger.error(`Bot error: ${err.message}`);
  });

  setBot(bot);
  return bot;
};

module.exports = { createBot, isAdmin };
