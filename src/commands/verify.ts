import {
  ButtonComponent, Client, Discord, Guard, Slash, SlashOption,
} from "discordx";
import {
  ButtonInteraction, CategoryChannel, Channel, CommandInteraction, GuildMember,
  MessageActionRow, MessageButton, Permissions, Role,
} from "discord.js";
import { EmbedUtils, GuildUtils, InteractionUtils } from "../utils/Utils.js";
import { Category } from "@discordx/utilities";
import {
  MinorKickedMessage, VerificationSetupMessage,
} from "../utils/Constants.js";
import { injectable } from "tsyringe";
import { PrismaClient } from "@prisma/client";
import {
  IsAdmin, IsUnverified, IsVerificationSetup,
} from "../guards/Verification.js";

@Discord()
@injectable()
@Category("Verification Commands")
class Verify {
  constructor(private _prisma: PrismaClient) {
  }

  @Slash("setup-verification", {
    description: "Setup the verification system.",
  })
  async setupVerify(
    @SlashOption(
      "verify-channel-category",
      {
        description: "The channel category where each new ticket will be" +
          " created.",
        type: "CHANNEL",
        channelTypes: ["GUILD_CATEGORY"],
      },
    )
      category: Channel,
    @SlashOption(
      "verified-role", {
        description: "The role that will be given to verified users.",
      },
    )
      role: Role,
    @SlashOption(
      "help-channel", {
        description: "The channel to optionally help users with verification.",
        type: "CHANNEL",
        channelTypes: ["GUILD_TEXT"],
        required: false,
      },
    )
      helpChannel: Channel | undefined,
    interaction: CommandInteraction,
  ) {
    await this._prisma.guild.update({
      where: {
        id: interaction.guild?.id,
      },
      data: {
        verificationCategory: category.id,
        verifiedRole: role.id,
      },
    });
    await InteractionUtils.replyOrFollowUp(
      interaction,
      {
        content: `Verification category set to: ${category}\nVerified role set to: <@&${role.id}>`,
        ephemeral: true,
      },
    );

    const verifyButton = new MessageButton()
    .setLabel("Verify")
    .setStyle("PRIMARY")
    .setCustomId("verify-button")
    .setEmoji("✅");

    const minorButton = new MessageButton()
    .setLabel("Minor")
    .setStyle("DANGER")
    .setCustomId("minor-button")
    .setEmoji("🧒");

    const actionRow = new MessageActionRow().addComponents([
      verifyButton,
      minorButton,
    ]);

    if (helpChannel) {
      const helpButton = new MessageButton()
      .setLabel("Help")
      .setStyle("LINK")
      .setURL(`https://discord.com/channels/${interaction.guild?.id}/${helpChannel.id}`);

      actionRow.addComponents(helpButton);
    }

    await interaction.channel?.send({
      content: VerificationSetupMessage(!!helpChannel),
      components: [actionRow],
    });
  }

  @ButtonComponent("verify-button")
  @Guard(IsUnverified, IsVerificationSetup)
  async verifyHandler(
    interaction: ButtonInteraction,
    client: Client,
  ) {
    const ticket = await interaction.guild?.channels.cache.find((channel) => channel.name === interaction.user.id);
    let channelId = ticket?.id;
    if (!channelId) {
      const guildInfo = await this._prisma.guild.findFirst({
        where: {
          id: interaction.guild?.id,
        },
        select: {
          verificationCategory: true,
          verifiedRole: true,
        },
      });
      const {
        verificationCategory: verificationCategoryID,
      } = guildInfo!;

      const verificationCategory = <CategoryChannel>interaction.guild?.channels.cache.get(
        verificationCategoryID!);
      const channel = await verificationCategory.createChannel(
        interaction.user.id,
        {
          permissionOverwrites: [
            {
              id: interaction.guild?.roles.everyone!,
              deny: "VIEW_CHANNEL",
            },
            {
              id: interaction.user.id,
              allow: [
                Permissions.FLAGS.VIEW_CHANNEL,
                Permissions.FLAGS.SEND_MESSAGES,
                Permissions.FLAGS.READ_MESSAGE_HISTORY,
              ],
            },
            {
              id: client.user?.id!,
              allow: ["VIEW_CHANNEL"],
            },
          ],
        },
      );
      channelId = channel.id;

      const embed = await EmbedUtils.createVerifyEmbed(
        interaction,
      );

      const verificationButton = new MessageButton()
      .setLabel("Verify")
      .setStyle("SUCCESS")
      .setCustomId("verify-accept");

      const verificationActionRow = new MessageActionRow().addComponents(
        verificationButton);

      await channel.send({
        content: `Welcome ${interaction.member} to the verification system!`,
        embeds: [embed],
        components: [verificationActionRow],
      });
    }

    const link = new MessageButton()
    .setStyle("LINK")
    .setLabel("Go To Channel")
    .setURL(`https://discord.com/channels/${interaction.guild?.id}/${channelId}`);

    const actionRow = new MessageActionRow().addComponents(link);

    await InteractionUtils.replyOrFollowUp(interaction, {
      content: ticket ? ("You already have an open ticket for verification!" +
        " Press this button to go there now.") : ("A private channel has" +
        " been created for you to verify yourself, press this button to go" +
        " there now."),
      components: [actionRow],
      ephemeral: true,
    });
  }

  @ButtonComponent("minor-button")
  @Guard(IsUnverified, IsVerificationSetup)
  async minorHandler(interaction: ButtonInteraction) {
    const member = interaction.member as GuildMember;
    await member.user.send({
      content: await MinorKickedMessage(interaction),
    });
    await member.kick("User is a minor");
  }

  @ButtonComponent("verify-accept")
  @Guard(IsAdmin)
  async verifyUserButton(interaction: ButtonInteraction) {
    await GuildUtils.verifyUser(interaction, this._prisma);
  }
}
