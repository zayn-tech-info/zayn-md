const config = require("../../config");

async function menu(sock, jid) {
  const prefix = process.env.PREFIX || ".";

  const featureStatus = Object.entries(config)
    .map(([key, val]) => `│ ${key}: ${val ? "ON" : "OFF"}`)
    .join("\n");

  const text = `╭─── ZAYN-MD Menu ───
│
│ ${prefix}ping - Check bot response time
│ ${prefix}menu - Show this menu
│ ${prefix}on <feature> - Enable a feature
│ ${prefix}off <feature> - Disable a feature
│
│ ── Feature Status ──
${featureStatus}
│
╰─────────────────────`;

  await sock.sendMessage(jid, { text });
}

module.exports = menu;
