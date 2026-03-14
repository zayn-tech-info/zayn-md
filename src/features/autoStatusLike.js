async function onMessageUpsert(sock, msg) {
  if (msg.key.remoteJid !== "status@broadcast") return;
  if (msg.key.fromMe) return;

  try {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "❤️", key: msg.key },
    });
  } catch (err) {
    console.error("Auto status like failed:", err.message);
  }
}

module.exports = { onMessageUpsert };
