import { Client, Discord, On, Once } from 'discordx';
import type { ArgsOf } from 'discordx';
import { prisma } from '../DB/prisma.js';

@Discord()
export abstract class AppDiscord {
  @On('messageDelete')
  onMessage([message]: ArgsOf<'messageDelete'>, client: Client) {
    console.log(client.user?.username, 'deleted a message:', message.content);
  }

  @On('guildCreate')
  private async botJoins(
    [guild]: ArgsOf<'guildCreate'>,
    client: Client
  ): Promise<void> {
    await prisma.guild.create({
      data: {
        id: guild.id,
      },
    });
    console.log(`Joined server "${guild.name}"`);
  }

  @On('guildDelete')
  private async botLeaves(
    [guild]: ArgsOf<'guildDelete'>,
    client: Client
  ): Promise<void> {
    console.log(`Bot left guild: "${guild.name}" deleting all related data...`);
    await prisma.guild.delete({
      where: {
        id: guild.id,
      },
    });
  }

  @Once('ready')
  private async botReady(
    [clientReady]: ArgsOf<'ready'>,
    client: Client
  ): Promise<void> {
    // make sure all guilds are in cache
    const guilds = await client.guilds.fetch();

    for (const guild of guilds.values()) {
      await prisma.guild.upsert({
        where: { id: guild.id },
        create: { id: guild.id },
        update: { id: guild.id },
      });
    }

    // uncomment this line to clear all guild commands,
    // useful when moving to global commands from guild commands
    // await client.clearApplicationCommands(
    //   ...client.guilds.cache.map((g) => g.id)
    // );

    // init all application commands
    await client.initApplicationCommands({
      guild: { log: true },
      global: { log: true },
    });

    // init permissions; enabled log to see changes
    await client.initApplicationPermissions(true);

    console.log('Bot started');
  }
}
