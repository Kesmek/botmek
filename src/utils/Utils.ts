import {
  BaseCommandInteraction,
  ButtonInteraction,
  Collection,
  CommandInteraction,
  GuildMember,
  Interaction,
  InteractionReplyOptions,
  MessageComponentInteraction,
  MessageEmbed,
  TextChannel,
  User,
} from "discord.js";
import { ModerationActions } from "./Constants.js";
import { ArgsOf } from "discordx";
import { PrismaClient } from "@prisma/client";

export class InteractionUtils {
  public static async replyOrFollowUp(
    interaction: BaseCommandInteraction | MessageComponentInteraction,
    replyOptions: (InteractionReplyOptions & { ephemeral?: boolean }) | string,
  ): Promise<void> {
    // if interaction is already replied
    if (interaction.replied) {
      await interaction.followUp(replyOptions);
      return;
    }

    // if interaction is deferred but not replied
    if (interaction.deferred) {
      await interaction.editReply(replyOptions);
      return;
    }

    // if interaction is not handled yet
    await interaction.reply(replyOptions);
  }
}

export class EmbedUtils {
  public static createLogEmbed(
    interaction: Interaction,
    moderationAction: ModerationActions,
    targetUser: GuildMember,
    targetRole?: string | null,
  ) {
    const role = interaction.guild?.roles.cache.get(targetRole ?? "");
    return new MessageEmbed()
    .setTitle(moderationAction)
    .setAuthor({
      name: `${interaction.user.username} (${interaction.user.id})`,
      iconURL: interaction.user.avatarURL() ?? "",
    })
    .setColor(role?.color ?? "DEFAULT")
    .setDescription(
      `**User:** ${targetUser}` +
      `\n**Tag:** ${targetUser.user.username}#${targetUser.user.discriminator}` +
      `\n**ID:** ${targetUser.id}` +
      (moderationAction === ModerationActions.Promotion
        ? `\n**Promoted To:** <@&${targetRole}>`
        : ""),
    )
    .setThumbnail(targetUser.displayAvatarURL());
  }

  public static async createVerifyEmbed(
    interaction: Interaction,
  ) {
    const adminsString = GuildUtils.stringifyMembers(await GuildUtils.getAdmins(
      interaction));
    return new MessageEmbed()
    .setTitle("Verification Instructions")
    .setImage(
      "https://cdn.discordapp.com/attachments/693526804304101387/957349020114759730/example.jpg")
    .setDescription(
      `To verify your age, you will need to send 3 pieces of information in the *__same__ image*:` +
      `\n- **Government Issued ID** that includes your birthday` +
      `\n- **The current date, handwritten**` +
      `\n- **Your discord tag, handwritten**` +
      `\n\nYou may exclude any other *personally identifying information* from your government issued ` +
      `ID, but we need to be able to tell it's a valid ID. An example is attached and either of ` +
      `${adminsString} will verify your age.\n\n*Note:* Once you are verified, these images ` +
      `along with this temporary channel will be permanently deleted.`,
    );
  }

  public static createSignupEmbed(
    [event]: ArgsOf<"guildScheduledEventCreate">,
  ) {
    return new MessageEmbed()
    .setTitle(event.name + " registration")
    .setThumbnail(event.coverImageURL() ?? "")
    .setAuthor({
      name: event.creator?.username ?? "",
      iconURL: event.creator?.displayAvatarURL(),
    })
    .setDescription(
      `**__Dancers__** (0)\n\n**__Floaters__** (0)\n\n**__Hosts__** (0)\n\n` +
      `**__Security__** (0)\n\n**__DJs__** (0)\n\n**__Photographers__** (0)`,
    );
  }

  public static async editSignupEmbed(
    staff: Record<string, string[]>,
    interaction: ButtonInteraction,
  ) {
    let description = "";
    for (const [position, ids] of Object.entries(staff)) {
      description += `\n**__${position}__** (${ids.length})\n`;
      for (const id of ids) {
        const member = await interaction.guild?.members.fetch(id);
        if (member) {
          description
            += `${member} (${member.user.username}#${member.user.discriminator})\n`;
        }
      }
    }
    description += ``;
    const embed = interaction.message.embeds[0] as MessageEmbed;
    return embed.setDescription(description);
  }
}

export class GuildUtils {
  public static async getAdmins(
    interaction: Interaction,
  ) {
    const members = await interaction.guild?.members.fetch({ force: true });
    return members?.filter((member) => !member.user.bot && member.permissions.has(
      ["BAN_MEMBERS"]));
  }

  public static stringifyMembers(members?: Collection<string, GuildMember>) {
    if (!members) {
      return "";
    }
    return members?.map((member) => `${member.user} (${member.user.username}#${member.user.discriminator})`)
    .join(", ");
  }

  public static safeMention(user: User | GuildMember) {
    if (user instanceof User) {
      return `${user} (${user.tag})`;
    } else {
      return `${user.user} (${user.user.tag})`;
    }
  }

  public static async verifyUser(
    interaction: ButtonInteraction | CommandInteraction,
    _prisma: PrismaClient,
  ) {
    await interaction.deferReply();
    const channel = interaction.channel as TextChannel;
    const guildInfo = await _prisma.guild.findFirst({
      where: {
        id: interaction.guild?.id,
      },
      select: {
        verifiedRole: true,
        moderationChannel: true,
        verificationCategory: true,
      },
    });
    const unverifiedMember = await interaction.guild?.members.fetch(channel.name);

    if (unverifiedMember) {
      await unverifiedMember.send({ content: `You have been verified in **${interaction.guild?.name}**! You can now see the full server and interact with the community.` });
      await unverifiedMember.roles.add(guildInfo?.verifiedRole!);
      await channel?.delete();
      if (guildInfo?.moderationChannel) {
        const modChannel = interaction.guild?.channels.cache.get(guildInfo?.moderationChannel) as TextChannel;
        const embed = EmbedUtils.createLogEmbed(
          interaction,
          ModerationActions.Verification,
          unverifiedMember,
          guildInfo?.verifiedRole,
        );
        await modChannel.send({
          embeds: [embed],
        });
        await InteractionUtils.replyOrFollowUp(
          interaction,
          { content: "User verified. Closing this ticket..." },
        );
      }
    } else {
      await InteractionUtils.replyOrFollowUp(interaction, {
        content: "Could not find user to verify in this channel! Please let" +
          " the bot owner <@211505087653085184> (Kesmek#0001) know what" +
          " happened so they can issue a fix.",
        ephemeral: true,
      });
    }
  }
}
