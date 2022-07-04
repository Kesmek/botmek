import { PrismaClient } from "@prisma/client";
import { singleton } from "tsyringe";
import {
  ButtonInteraction, CommandInteraction, GuildMember, TextChannel,
} from "discord.js";
import { ModerationActions } from "./Constants.js";
import { EmbedUtils } from "./Utils.js";

@singleton()
export class Logger {
  constructor(private _prisma: PrismaClient) {
  }

  public async log(
    interaction: ButtonInteraction | CommandInteraction,
    moderationAction: ModerationActions,
    targetUser: GuildMember,
    targetRole?: string,
  ) {
    const guildInfo = await this._prisma.guild.findFirst({
      where: {
        id: interaction.guild?.id,
      },
    });
    const modChannelId = guildInfo?.moderationChannel;
    if (modChannelId) {
      const modChannel = await interaction.guild?.channels.fetch(modChannelId) as TextChannel;
      const embed = EmbedUtils.createLogEmbed(
        interaction,
        moderationAction,
        targetUser,
        targetRole,
      );
      await modChannel.send({
        embeds: [embed],
      });
      console.log(`${interaction.user.username}#${interaction.user.discriminator}` +
        ` ${moderationAction} ${targetUser.user.username}#${targetUser.user.discriminator}`);
    }
  }
}
