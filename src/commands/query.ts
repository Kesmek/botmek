import { Guild, Event } from '.prisma/client';
import { CommandInteraction } from 'discord.js';
import { Discord, Permission, Slash, SlashChoice, SlashOption } from 'discordx';
import { prisma } from '../DB/prisma.js';

@Discord()
@Permission({ type: 'USER', permission: true, id: '211505087653085184' })
export class Query {
  @Slash('query')
  async query(
    @SlashChoice({ name: 'guild', value: 'Guild' })
    @SlashChoice({ name: 'events', value: 'Event' })
    @SlashOption('type', { description: 'Query which table?' })
    type: string,
    interaction: CommandInteraction
  ) {
    let results: (Event | Guild)[] = [];
    if (!interaction.guildId) return;
    switch (type) {
      case 'Guild':
        results = await prisma.guild.findMany();
        break;
      case 'Event':
        results = await prisma.event.findMany({
          where: { endTime: { lte: new Date() }, guildId: interaction.guildId },
          take: 2,
          orderBy: { id: 'desc' },
        });
    }
    const formatted = this.parseQuery(results);
    console.log(formatted);
    if (formatted.length > 4) {
      interaction.reply(formatted);
    } else {
      let response = '';
      switch (type) {
        case 'Guild':
          response = 'No guilds found';
          break;
        case 'Event':
          response = 'No inactive events found';
      }
      interaction.reply(response);
    }
  }

  private parseQuery(query: (Event | Guild)[]) {
    return JSON.stringify(query);
  }
}
