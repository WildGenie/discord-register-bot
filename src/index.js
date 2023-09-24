import { ActivityType, Client, Collection, GatewayIntentBits } from "discord.js";

import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";

import logger from "#helpers/logger";

dotenv.config();

const { DISCORD_BOT_TOKEN, MONGO_URI, THUMBNAIL_URL } = process.env;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
  presence: {
    activities: [
      {
        name: "Kodluyoruz Kayıt Botu | https://github.com/Kodluyoruz/discord-register-bot/",
        type: ActivityType.Custom,
      },
    ],
  },
});

client.thumbnailUrl =
  THUMBNAIL_URL ||
  "https://cdn.discordapp.com/attachments/1091296968879386725/1155376210583506954/Kodluyoruz.png";

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.commandArray = [];

client.logger = logger;

client.logger.info("Fonksiyon: fonksiyonlar yükleniyor");
const functionFolders = await fs.promises.readdir(`./src/functions`);

for (const folder of functionFolders) {
  client.logger.info(`Fonksiyon: └── ${folder} klasörü işleniyor`);
  const functionFiles = await fs.promises.readdir(`./src/functions/${folder}`);
  const jsFiles = functionFiles.filter((file) => file.endsWith(".js"));

  for (const file of jsFiles) {
    try {
      client.logger.info(`Fonksiyon:     ├── ${file} dosyası işleniyor`);
      const module = await import(`./functions/${folder}/${file}`);
      module.default(client);
    } catch (error) {
      client.logger.error(error);
    }
  }
}

client.logger.info("Fonksiyon: fonksiyonlar yüklendi");

client.logger.info("Fonksiyon: handlelar yükleniyor");
await Promise.all([client.handleEvents(), client.handleCommands(), client.handleComponents()]);
client.logger.info("Fonksiyon: handlelar yüklendi");

try {
  await mongoose.connect(MONGO_URI);
  client.logger.info("Database: bağlantı başarılı");
  client.logger.info("Client: client login ediliyor");
  await client.login(DISCORD_BOT_TOKEN);
} catch (error) {
  client.logger.error(error);
}
