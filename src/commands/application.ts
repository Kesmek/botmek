import type { CommandInteraction } from "discord.js";
import {
  ButtonInteraction, Channel, GuildMember, Message, MessageActionRow,
  MessageButton, MessageMentions, Modal, ModalActionRowComponent,
  ModalSubmitInteraction, Role, TextChannel, TextInputComponent,
} from "discord.js";
import {
  ButtonComponent, Discord, Guard, ModalComponent, Slash, SlashOption,
} from "discordx";
import { injectable } from "tsyringe";
import { PrismaClient } from "@prisma/client";
import { Logger } from "../utils/Logger.js";
import { InteractionUtils } from "../utils/Utils.js";
import { ModerationActions } from "../utils/Constants.js";
import { IsApplicationSetup } from "../guards/IsApplicationSetup.js";

@Discord()
@injectable()
export class Application {
  constructor(
    private _prisma: PrismaClient,
    private _Logger: Logger,
  ) {
  }

  private async applicationModalBuilder(
    interaction: ButtonInteraction,
  ) {
    const member = interaction.member as GuildMember;
    const role = interaction.guild?.roles.cache.find((_role) => _role.name === interaction.component.label);
    if (member.roles.cache.has(role?.id ?? "")) {
      return await InteractionUtils.replyOrFollowUp(interaction, {
        content: "You already have this position!",
        ephemeral: true,
      });
    } else {
      const modal = new Modal()
      .setTitle(role!?.name + "application")
      .setCustomId("application-modal");

      const roleInputComponent = new TextInputComponent()
      .setCustomId("roleField")
      .setLabel("What position are you applying for?")
      .setStyle("SHORT")
      .setValue(role!?.name)
      .setRequired(true);

      const whyInputComponent = new TextInputComponent()
      .setCustomId("whyField")
      .setLabel("Why do you want this position?")
      .setStyle("PARAGRAPH")
      .setRequired(true);

      const experienceInputComponent = new TextInputComponent()
      .setCustomId("experienceField")
      .setLabel("How much relevant experience do you have?")
      .setStyle("PARAGRAPH")
      .setRequired(true);

      const availabilitiesInputComponent = new TextInputComponent()
      .setCustomId("availabilitiesField")
      .setLabel("What are your availabilities?")
      .setStyle("SHORT")
      .setRequired(true);

      const dancersInputComponent = new TextInputComponent()
      .setCustomId("vrTypeField")
      .setLabel("Are you half-body, full-body or PC only?")
      .setStyle("SHORT")
      .setRequired(true);

      const actionRow0 = new MessageActionRow<ModalActionRowComponent>().addComponents(
        roleInputComponent,
      );
      const actionRow1 = new MessageActionRow<ModalActionRowComponent>().addComponents(
        whyInputComponent,
      );
      const actionRow2 = new MessageActionRow<ModalActionRowComponent>().addComponents(
        experienceInputComponent,
      );
      const actionRow3 = new MessageActionRow<ModalActionRowComponent>().addComponents(
        availabilitiesInputComponent,
      );
      const actionRow4 = new MessageActionRow<ModalActionRowComponent>().addComponents(
        dancersInputComponent,
      );

      modal.addComponents(
        actionRow0,
        actionRow1,
        actionRow2,
        actionRow3,
        actionRow4,
      );
      return modal;
    }
  }

  @ButtonComponent("dancer-apply")
  @Guard(IsApplicationSetup)
  async dancerApplication(interaction: ButtonInteraction) {
    const modal = await this.applicationModalBuilder(interaction);
    if (!modal) {
      return;
    }
    await interaction.showModal(modal);
  }

  @ButtonComponent("host-apply")
  @Guard(IsApplicationSetup)
  async hostApplication(interaction: ButtonInteraction) {
    const modal = await this.applicationModalBuilder(interaction);
    if (!modal) {
      return;
    }
    await interaction.showModal(modal);
  }

  @ButtonComponent("security-apply")
  @Guard(IsApplicationSetup)
  async securityApplication(interaction: ButtonInteraction) {
    const modal = await this.applicationModalBuilder(interaction);
    if (!modal) {
      return;
    }
    await interaction.showModal(modal);
  }

  @ButtonComponent("photographer-apply")
  @Guard(IsApplicationSetup)
  async photographerApplication(interaction: ButtonInteraction) {
    const modal = await this.applicationModalBuilder(interaction);
    if (!modal) {
      return;
    }
    await interaction.showModal(modal);
  }

  @ButtonComponent("dj-apply")
  @Guard(IsApplicationSetup)
  async djApplication(interaction: ButtonInteraction) {
    const modal = await this.applicationModalBuilder(interaction);
    if (!modal) {
      return;
    }
    await interaction.showModal(modal);
  }

  @ButtonComponent("admin-apply")
  @Guard(IsApplicationSetup)
  async adminApplication(interaction: ButtonInteraction) {
    const modal = await this.applicationModalBuilder(interaction);
    if (!modal) {
      return;
    }
    await interaction.showModal(modal);
  }

  @ModalComponent("application-modal")
  async handleApplication(interaction: ModalSubmitInteraction) {
    try {

      const [roleName, why, experience, availabilities, vrType] = [
        "roleField",
        "whyField",
        "experienceField",
        "availabilitiesField",
        "vrTypeField",
      ].map((id) => interaction.fields.getTextInputValue(id));
      const guildInfo = await this._prisma.guild.findFirst({
        where: {
          id: interaction.guild?.id,
        },
      });
      const applicationsChannel = await interaction.guild?.channels.fetch(
        guildInfo?.applicationChannel!) as TextChannel;
      const role = interaction.guild?.roles.cache.find((_role) => _role.name === roleName);
      if (!role) {
        return await interaction.reply({
          content: "Role could not be found! Please let the bot owner know so" +
            " they can issue a fix: <@211505087653085184> (Kesmek#0001).",
          ephemeral: true,
        });
      }

      const acceptButton = new MessageButton()
      .setCustomId("accept-application")
      .setLabel("Promote")
      .setStyle("SUCCESS");

      await interaction.reply({
        content: "Thank you for your application, it has been sent in for" +
          " review. You may be contacted if we need more information. Please" +
          " be patient while we process your application.",
        ephemeral: true,
      });
      await applicationsChannel.send({
        content: `${interaction.user} submitted an application for ${role}\n\n` +
          `**Why:** ${why}\n\n**Experience:** ${experience}\n\n` +
          `**Availabilities:** ${availabilities}\n\n**VR Setup:** ${vrType}`,
        components: [
          new MessageActionRow().addComponents(
            acceptButton,
          ),
        ],
      });
    } catch (e) {
      console.error(e);
    }
  }

  @ButtonComponent("accept-application")
  async acceptApplication(interaction: ButtonInteraction) {
    try {
      const mentions = interaction.message.mentions as MessageMentions;
      const member = mentions.members?.first();
      const role = mentions.roles.first();

      const guildInfo = await this._prisma.guild.findFirst({
        where: {
          id: interaction.guildId!,
        },
      });

      if (member) {
        await member.roles.add(role?.id ?? "");
        await member.roles.add(guildInfo?.staffRole!);
        await (interaction.message as Message).delete();
        await this._Logger.log(
          interaction,
          ModerationActions.Promotion,
          member,
          role?.id,
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  @Slash("setup-applications")
  async setupApplications(
    @SlashOption("application-channel", {
      description: "Channel where the applications will be sent for review",
      type: "CHANNEL",
      channelTypes: ["GUILD_TEXT"],
    })
      channel: Channel,
    @SlashOption("dancer-role", {
      description: "The role that dancers will receive",
      type: "ROLE",
      required: false,
    })
      dancerRole: Role | undefined,
    @SlashOption("host-role", {
      description: "The role that hosts will receive",
      type: "ROLE",
      required: false,
    })
      hostRole: Role | undefined,
    @SlashOption("security-role", {
      description: "The role that security will receive",
      type: "ROLE",
      required: false,
    })
      securityRole: Role | undefined,
    @SlashOption("photographer-role", {
      description: "The role that photographers will receive",
      type: "ROLE",
      required: false,
    })
      photographerRole: Role | undefined,
    @SlashOption("dj-role", {
      description: "The role that DJs will receive",
      type: "ROLE",
      required: false,
    })
      djRole: Role | undefined,
    @SlashOption("admin-role", {
      description: "The role that admins will receive",
      type: "ROLE",
      required: false,
    })
      adminRole: Role | undefined,
    interaction: CommandInteraction,
  ) {
    await interaction.deferReply();

    const buttons: MessageButton[] = [];
    if (dancerRole) {
      buttons.push(new MessageButton().setStyle("PRIMARY")
      .setEmoji(dancerRole.unicodeEmoji ?? "")
      .setLabel(dancerRole.name)
      .setCustomId("dancer-apply"));
    }
    if (hostRole) {
      buttons.push(new MessageButton().setStyle("PRIMARY")
      .setEmoji(hostRole.unicodeEmoji ?? "")
      .setLabel(hostRole.name)
      .setCustomId("host-apply"));
    }
    if (securityRole) {
      buttons.push(new MessageButton().setStyle("PRIMARY")
      .setEmoji(securityRole.unicodeEmoji ?? "")
      .setLabel(securityRole.name)
      .setCustomId("security-apply"));
    }
    if (photographerRole) {
      buttons.push(new MessageButton().setStyle("PRIMARY")
      .setEmoji(photographerRole.unicodeEmoji ?? "")
      .setLabel(photographerRole.name)
      .setCustomId("photographer-apply"));
    }
    if (djRole) {
      buttons.push(new MessageButton().setStyle("PRIMARY")
      .setEmoji(djRole.unicodeEmoji ?? "")
      .setLabel(djRole.name)
      .setCustomId("dj-apply"));
    }
    if (adminRole) {
      buttons.push(new MessageButton().setStyle("PRIMARY")
      .setEmoji(adminRole.unicodeEmoji ?? "")
      .setLabel(adminRole.name)
      .setCustomId("admin-apply"));
    }

    let actionRow = new MessageActionRow();
    let actionRow2 = new MessageActionRow();
    if (buttons.length < 1) {
      return await InteractionUtils.replyOrFollowUp(interaction, {
        content: "All staff positions are currently **__closed__**. Please" +
          " check in later to see if any availabilities open up.",
      });
    }
    actionRow.addComponents(buttons.slice(0, 4));
    if (buttons.length > 4) {
      actionRow2.addComponents(buttons.slice(4));
    }

    await this._prisma.guild.update({
      where: {
        id: interaction.guild?.id,
      },
      data: {
        applicationChannel: channel.id,
      },
    });

    await InteractionUtils.replyOrFollowUp(interaction, {
      content: "Select one of the roles you'd like to apply for. If you" +
        " don't see the position you'd like, it's because we are currently" +
        " **not looking** for more staff in that position.",
      components: buttons.length > 4 ? [actionRow, actionRow2] : [actionRow],
    });
  }

}
