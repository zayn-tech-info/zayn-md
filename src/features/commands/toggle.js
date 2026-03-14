const config = require("../../config");

const FEATURE_MAP = {
  antidelete: "antiDelete",
  autostatusview: "autoStatusView",
  autostatuslike: "autoStatusLike",
  antiviewonce: "antiViewOnce",
};

const validNames = Object.keys(FEATURE_MAP).join(", ");

async function on(sock, jid, args) {
  const input = (args[0] || "").toLowerCase();
  const configKey = FEATURE_MAP[input];

  if (!configKey) {
    await sock.sendMessage(jid, {
      text: `❌ Unknown feature: "${args[0] || ""}"\n\nAvailable: ${validNames}`,
    });
    return;
  }

  config[configKey] = true;
  await sock.sendMessage(jid, { text: `✅ ${configKey} has been enabled` });
}

async function off(sock, jid, args) {
  const input = (args[0] || "").toLowerCase();
  const configKey = FEATURE_MAP[input];

  if (!configKey) {
    await sock.sendMessage(jid, {
      text: `❌ Unknown feature: "${args[0] || ""}"\n\nAvailable: ${validNames}`,
    });
    return;
  }

  config[configKey] = false;
  await sock.sendMessage(jid, { text: `⛔ ${configKey} has been disabled` });
}

module.exports = { on, off };
