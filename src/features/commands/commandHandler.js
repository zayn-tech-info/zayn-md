const ping = require("./ping");
const menu = require("./menu");
const toggle = require("./toggle");

const commands = {
  ping,
  menu,
  on: toggle.on,
  off: toggle.off,
};

function extractText(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    ""
  );
}

async function onMessageUpsert(sock, msg) {
  if (!msg.message || !msg.key.fromMe) return;

  const prefix = process.env.PREFIX || ".";
  const text = extractText(msg).trim();

  if (!text.startsWith(prefix)) return;

  const withoutPrefix = text.slice(prefix.length);
  const [cmdName, ...args] = withoutPrefix.split(/\s+/);
  const command = commands[cmdName.toLowerCase()];

  if (!command) return;

  const jid = msg.key.remoteJid;

  try {
    await command(sock, jid, args, msg);
  } catch (err) {
    console.error(`Command "${cmdName}" failed:`, err.message);
  }
}

module.exports = { onMessageUpsert };
