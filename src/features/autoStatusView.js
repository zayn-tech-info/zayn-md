async function onMessageUpsert(sock, msg) {
  if (msg.key.remoteJid !== "status@broadcast") return;
  if (msg.key.fromMe) return;

  try {
    await sock.readMessages([msg.key]);
  } catch (err) {
    console.error("Auto status view failed:", err.message);
  }
}

module.exports = { onMessageUpsert };
