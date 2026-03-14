const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");
const { registerFeatures } = require("../features");

const AUTH_FOLDER = path.join(__dirname, "..", "..", "auth_info");

function restoreSession() {
  const sessionId = process.env.SESSION_ID;
  if (!sessionId) return;

  if (!fs.existsSync(AUTH_FOLDER)) {
    fs.mkdirSync(AUTH_FOLDER, { recursive: true });
  }

  const existingFiles = fs.readdirSync(AUTH_FOLDER).filter((f) => f.endsWith(".json"));
  if (existingFiles.length > 0) return;

  try {
    const json = Buffer.from(sessionId, "base64").toString("utf-8");
    const bundle = JSON.parse(json);

    for (const [name, data] of Object.entries(bundle)) {
      fs.writeFileSync(
        path.join(AUTH_FOLDER, `${name}.json`),
        JSON.stringify(data)
      );
    }

    console.log("🔑 Session restored from SESSION_ID");
  } catch (err) {
    console.error("Failed to restore session from SESSION_ID:", err.message);
  }
}

const logger = pino({ level: "silent" });

let sock = null;

async function startConnection() {
  restoreSession();

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: [process.env.BOT_NAME || "MyBot", "Chrome", "1.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log("\n📱 Scan this QR code to connect:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ Bot is running");
    }

    if (connection === "close") {
      const statusCode =
        lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(
        `Connection closed (code: ${statusCode}). ${shouldReconnect ? "Reconnecting..." : "Logged out."}`
      );

      if (shouldReconnect) {
        startConnection();
      }
    }
  });

  registerFeatures(sock);

  return sock;
}

function getSocket() {
  return sock;
}

module.exports = { startConnection, getSocket };
