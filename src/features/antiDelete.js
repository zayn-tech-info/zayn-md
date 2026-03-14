const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const messageStore = new Map();

const MAX_STORE_SIZE = 5000;
const MAX_AGE_MS = 30 * 60 * 1000;

function pruneStore() {
  if (messageStore.size <= MAX_STORE_SIZE) return;
  const now = Date.now();
  for (const [id, entry] of messageStore) {
    if (now - entry.storedAt > MAX_AGE_MS) {
      messageStore.delete(id);
    }
  }
}

function onMessageUpsert(sock, msg) {
  if (!msg.message || msg.key.fromMe) return;

  messageStore.set(msg.key.id, {
    key: msg.key,
    message: msg.message,
    storedAt: Date.now(),
  });

  pruneStore();
}

async function onMessageDelete(sock, deletion) {
  const keys = deletion.keys || [];

  for (const key of keys) {
    const stored = messageStore.get(key.id);
    if (!stored) continue;

    const jid = stored.key.remoteJid;
    const message = stored.message;

    try {
      const text =
        message.conversation ||
        message.extendedTextMessage?.text;

      if (text) {
        await sock.sendMessage(jid, {
          text: `🚨 Deleted message:\n${text}`,
        });
      }

      if (message.imageMessage) {
        const buffer = await downloadMediaMessage(
          { key: stored.key, message },
          "buffer",
          {}
        );
        const caption = message.imageMessage.caption || "";
        await sock.sendMessage(jid, {
          image: buffer,
          caption: `🚨 Deleted message:${caption ? `\n${caption}` : ""}`,
        });
      }

      if (message.videoMessage) {
        const buffer = await downloadMediaMessage(
          { key: stored.key, message },
          "buffer",
          {}
        );
        const caption = message.videoMessage.caption || "";
        await sock.sendMessage(jid, {
          video: buffer,
          caption: `🚨 Deleted message:${caption ? `\n${caption}` : ""}`,
        });
      }
    } catch (err) {
      console.error("Anti-delete failed for message", key.id, err.message);
    }

    messageStore.delete(key.id);
  }
}

module.exports = { onMessageUpsert, onMessageDelete };
