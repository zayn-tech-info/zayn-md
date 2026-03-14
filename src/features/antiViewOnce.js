const { downloadMediaMessage } = require("@whiskeysockets/baileys");

function extractViewOnce(message) {
  const wrapper =
    message.viewOnceMessage ||
    message.viewOnceMessageV2 ||
    message.viewOnceMessageV2Extension;

  if (!wrapper?.message) return null;

  const inner = wrapper.message;
  if (inner.imageMessage) return { type: "image", media: inner.imageMessage };
  if (inner.videoMessage) return { type: "video", media: inner.videoMessage };
  return null;
}

async function onMessageUpsert(sock, msg) {
  if (!msg.message || msg.key.fromMe) return;

  const viewOnce = extractViewOnce(msg.message);
  if (!viewOnce) return;

  const jid = msg.key.remoteJid;

  try {
    const unwrapped = {
      key: msg.key,
      message: { [viewOnce.type + "Message"]: viewOnce.media },
    };

    const buffer = await downloadMediaMessage(unwrapped, "buffer", {});
    const caption = viewOnce.media.caption || "";

    await sock.sendMessage(jid, {
      [viewOnce.type]: buffer,
      caption: caption
        ? `🔓 View-once opened:\n${caption}`
        : "🔓 View-once opened",
    });
  } catch (err) {
    console.error("Anti view-once failed:", err.message);
  }
}

module.exports = { onMessageUpsert };
