async function ping(sock, jid, args, msg) {
  const start = Date.now();
  await sock.sendMessage(jid, { text: "⏳ Pinging..." });
  const latency = Date.now() - start;
  await sock.sendMessage(jid, { text: `🏓 Pong! ${latency}ms` });
}

module.exports = ping;
