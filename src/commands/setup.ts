import { Discord, Slash, SlashOption } from "discordx";
import { CommandInteraction, Role, TextChannel } from "discord.js";
import { injectable } from "tsyringe";
import { PrismaClient } from "@prisma/client";

@Discord()
@injectable()
export class Setup {
  constructor(private _prisma: PrismaClient) {
  }

  @Slash("setup", {
    description: "run the first time setup of the bot.",
  })
  async setup(
    @SlashOption("moderator-logs", {
      description: "Channel where moderation actions will be logged",
      type: "CHANNEL",
      channelTypes: ["GUILD_TEXT"],
    })
      modChannel: TextChannel,
    @SlashOption("event-signup-channel", {
      description: "Channel where event signups will take place",
      type: "CHANNEL",
      channelTypes: ["GUILD_TEXT"],
    })
      eventChannel: TextChannel,
    @SlashOption("staff-role", {
      description: "Role that all staff must have",
      type: "ROLE",
    })
      staffRole: Role,
    interaction: CommandInteraction,
  ) {
    await this._prisma.guild.update({
      where: {
        id: interaction.guild?.id,
      },
      data: {
        moderationChannel: modChannel.id,
        signupChannel: eventChannel.id,
        staffRole: staffRole.id,
      },
    });
    await interaction.reply({
      content: `Setup complete! Moderation actions will now be logged in ${modChannel}. ` +
        `Event signups will take place in ${eventChannel}. Staff role is assigned to ${staffRole}. ` +
        `Please ensure that the bot has the appropriate permissions to log to those channels.`,
      ephemeral: true,
    });
  }
}
