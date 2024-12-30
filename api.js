const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const axios = require("axios");
const shelljs = require("shelljs");

const config = require("./config.json");
const { Client, LocalAuth } = require("whatsapp-web.js");

process.title = "whatsapp-node-api";
global.client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true },
  logLevel: 'debug',             // Log detailed output
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});

global.authed = false;

const app = express();

const port = process.env.PORT || config.port;
//Set Request Size Limit 50 MB
app.use(bodyParser.json({ limit: "50mb" }));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

client.on("qr", (qr) => {
  console.log("qr");
  fs.writeFileSync("./components/last.qr", qr);
});

client.on("authenticated", () => {
  console.log("AUTH!");
  authed = true;

  try {
    fs.unlinkSync("./components/last.qr");
  } catch (err) {}
});

client.on("auth_failure", () => {
  console.log("AUTH Failed !");
  process.exit();
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  if (config.webhook.enabled) {
    if (msg.hasMedia) {
      const attachmentData = await msg.downloadMedia();
      msg.attachmentData = attachmentData;
    }
    axios.post(config.webhook.path, { msg });
  }
});
client.on("disconnected", () => {
  console.log("disconnected");
});
client.initialize();

const chatRoute = require("./components/chatting");
const groupRoute = require("./components/group");
const authRoute = require("./components/auth");
const contactRoute = require("./components/contact");
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await client.destroy(); // Destroy the client session properly
  process.exit(0);
});
const path = "./.wwebjs_auth";
if (fs.existsSync(path) && fs.readdirSync(path).length === 0) {
  console.log("Session data is corrupted. Deleting...");
  fs.rmSync(path, { recursive: true, force: true });
}

client.on("auth_failure", (msg) => {
  console.error("AUTH Failed! Cleaning session and retrying...");
  fs.rmSync("./.wwebjs_auth", { recursive: true, force: true });
  process.exit(1); // Restart the process
});
app.use(function (req, res, next) {
  console.log(req.method + " : " + req.path);
  next();
});
app.use("/chat", chatRoute);
app.use("/group", groupRoute);
app.use("/auth", authRoute);
app.use("/contact", contactRoute);
console.log('haha')
app.listen(port, () => {
  console.log("Server Running Live on Port : " + port);
});
