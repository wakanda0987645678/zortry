
import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

let bot: TelegramBot | null = null;
const userWallets = new Map<number, string>(); // chatId -> wallet address

export function initTelegramBot() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN not set, Telegram bot disabled');
    return;
  }

  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot?.sendMessage(
      chatId,
      '👋 Welcome to CoinIT Notifications!\n\n' +
      'Connect your wallet to receive notifications about:\n' +
      '• New coin creations\n' +
      '• Trading activity\n' +
      '• Rewards earned\n\n' +
      'Use /connect <wallet_address> to link your wallet.'
    );
  });

  bot.onText(/\/connect (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const walletAddress = match?.[1];

    if (!walletAddress || !walletAddress.startsWith('0x')) {
      bot?.sendMessage(chatId, '❌ Invalid wallet address. Please use format: /connect 0x...');
      return;
    }

    userWallets.set(chatId, walletAddress.toLowerCase());
    bot?.sendMessage(
      chatId,
      `✅ Wallet connected: ${walletAddress}\n\nYou will now receive notifications for this wallet.`
    );
  });

  bot.onText(/\/disconnect/, (msg) => {
    const chatId = msg.chat.id;
    userWallets.delete(chatId);
    bot?.sendMessage(chatId, '✅ Wallet disconnected. You will no longer receive notifications.');
  });

  bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    const wallet = userWallets.get(chatId);
    
    if (!wallet) {
      bot?.sendMessage(chatId, '❌ No wallet connected. Use /connect <wallet_address> to connect.');
      return;
    }

    bot?.sendMessage(chatId, `✅ Connected to wallet: ${wallet}`);
  });

  console.log('Telegram bot initialized');
}

export async function sendTelegramNotification(
  walletAddress: string,
  title: string,
  message: string,
  type: string
) {
  if (!bot) return;

  const emoji = {
    coin_created: '🪙',
    buy: '💰',
    sell: '💸',
    trade: '🔄',
    reward: '🎁'
  }[type] || '📢';

  // Find all chat IDs connected to this wallet
  const chatIds = Array.from(userWallets.entries())
    .filter(([_, wallet]) => wallet.toLowerCase() === walletAddress.toLowerCase())
    .map(([chatId]) => chatId);

  for (const chatId of chatIds) {
    try {
      await bot.sendMessage(
        chatId,
        `${emoji} *${title}*\n\n${message}`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error(`Failed to send Telegram notification to ${chatId}:`, error);
    }
  }
}

export { bot };
