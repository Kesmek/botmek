import 'reflect-metadata';
import 'dotenv/config';
import { Intents, Interaction } from 'discord.js';
import { Client } from 'discordx';
import { dirname, importx } from '@discordx/importer';
import { prisma } from './DB/prisma.js';

export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  // If you only want to use global commands only, comment this line
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
});

client.on('interactionCreate', (interaction: Interaction) => {
  client.executeInteraction(interaction);
});

async function run() {
  await importx(dirname(import.meta.url) + '/{events,commands}/**/*.{ts,js}');

  if (!process.env.BOT_TOKEN) {
    throw Error('Could not find BOT_TOKEN in your environment');
  }

  await client.login(process.env.BOT_TOKEN);
}

try {
  run();
} catch (error) {
  console.error(error);
} finally {
  prisma.$disconnect();
}
