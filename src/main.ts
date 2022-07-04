import "reflect-metadata";

import { container } from "tsyringe";
import dotenv from "dotenv";
import { dirname, importx } from "@discordx/importer";
import { Intents } from "discord.js";
import { Client, ClientOptions, DIService } from "discordx";
import { PrismaClient } from "@prisma/client";

export class Main {
  public static start = async () => {
    dotenv.config();
    DIService.container = container;
    const clientOps: ClientOptions = {
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
      ],
      silent: false,
    };
    // if (this.environment === "development") {
    clientOps["botGuilds"] = [
      (client: Client) => client.guilds.cache.map((guild) => guild.id),
    ];
    // }
    const bot = new Client(clientOps);

    if (!container.isRegistered(Client)) {
      container.registerInstance(Client, bot);
    }
    container.registerInstance(PrismaClient, new PrismaClient());

    // The following syntax should be used in the ECMAScript environment
    await importx(dirname(import.meta.url) + "/{events,commands}/**/*.{ts,js}");

    // Log in with your bot token
    await bot.login(process.env.BOT_TOKEN!);
  };
}

try {
  await Main.start();
} catch (e) {
  console.error(e);
} finally {
  container.resolve(PrismaClient)
  .$disconnect();
}
