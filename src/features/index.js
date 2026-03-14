const config = require("../config");
const commandHandler = require("./commands/commandHandler");
const antiDelete = require("./antiDelete");
const autoStatusView = require("./autoStatusView");
const autoStatusLike = require("./autoStatusLike");
const antiViewOnce = require("./antiViewOnce");

function registerFeatures(sock) {
  sock.ev.on("messages.upsert", ({ messages }) => {
    for (const msg of messages) {
      commandHandler.onMessageUpsert(sock, msg);

      if (config.antiDelete) antiDelete.onMessageUpsert(sock, msg);
      if (config.autoStatusView) autoStatusView.onMessageUpsert(sock, msg);
      if (config.autoStatusLike) autoStatusLike.onMessageUpsert(sock, msg);
      if (config.antiViewOnce) antiViewOnce.onMessageUpsert(sock, msg);
    }
  });

  sock.ev.on("messages.delete", (deletion) => {
    if (config.antiDelete) antiDelete.onMessageDelete(sock, deletion);
  });

  console.log("🧩 Features registered:", Object.entries(config)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(", "));
}

module.exports = { registerFeatures };
