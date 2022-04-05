import { Event } from '@prisma/client';
import {
  ButtonInteraction,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { ButtonComponent, Discord, Guard, Permission, Slash } from 'discordx';
import { prisma } from '../DB/prisma.js';
import { NotBotInteraction } from '../guards/notBotInteraction.js';
import { TimeUtils } from '../utils/utils.js';
import { getDefaultPermissions } from './defaultPermissions.js';
import { errorReply } from './generalCommands.js';

const { convertToMilli, TIME_UNIT } = TimeUtils;
@Discord()
@Permission((guild, cmd) => getDefaultPermissions(guild, cmd))
@Guard(NotBotInteraction)
export class StaffCommands {
  @Slash('setup-registration')
  async setupRegistration(interaction: CommandInteraction) {
    //Ensure guildId exists
    if (!interaction.guildId) {
      errorReply(interaction);
      return;
    }

    const currentEvent = await this.getCurrentEvent(interaction.guildId);
    if (currentEvent) {
      this.warnUser(interaction, currentEvent);
      return;
    }
    const lastEvent = await prisma.event.findFirst({
      where: {
        endTime: {
          lt: new Date(),
        },
        guildId: interaction.guildId,
      },
      orderBy: {
        id: 'desc',
      },
    });
    await interaction.deferReply();

    const embed = new MessageEmbed()
      .addFields([
        { name: 'Dancers', value: '0', inline: true },
        { name: 'Floaters', value: '0', inline: true },
        { name: 'Hosts', value: '0', inline: true },
        { name: 'Security', value: '0', inline: true },
        { name: 'DJs', value: '0', inline: true },
        { name: 'Photographers', value: '0', inline: true },
      ])
      .setDescription(
        `**__Dancers__**\n\n**__Floaters__**\n\n**__Hosts__**\n\n**__Security__**\n\n**__DJs__**\n\n**__Photographers__**\n\n**__Deadline__**\n<t:${Math.round(
          this.getNextSaturday().getTime() / 1000
        )}:R>\n`
      )
      .setTitle('Staff Registration')
      .setFooter({
        text: interaction.user.tag,
        iconURL: interaction.user.avatarURL() ?? undefined,
      })
      .setTimestamp(Date.now());

    const dancerButton = new MessageButton()
      .setLabel('Dancer')
      .setEmoji('💃')
      .setStyle('PRIMARY')
      .setCustomId('dancer-button');

    const hostButton = new MessageButton()
      .setLabel('Host')
      .setEmoji('🎤')
      .setStyle('PRIMARY')
      .setCustomId('host-button');

    const securityButton = new MessageButton()
      .setLabel('Security')
      .setEmoji('🛡')
      .setStyle('PRIMARY')
      .setCustomId('security-button');

    const djButton = new MessageButton()
      .setLabel('DJ')
      .setEmoji('🎶')
      .setStyle('PRIMARY')
      .setCustomId('dj-button');

    const photographerButton = new MessageButton()
      .setLabel('Photographer')
      .setEmoji('📸')
      .setStyle('PRIMARY')
      .setCustomId('photographer-button');

    const floaterButton = new MessageButton()
      .setLabel('Floater')
      .setEmoji('🕴')
      .setStyle('PRIMARY')
      .setCustomId('floater-button');

    const firstRow = new MessageActionRow().addComponents(
      dancerButton,
      floaterButton,
      hostButton
    );

    const secondRow = new MessageActionRow().addComponents(
      securityButton,
      djButton,
      photographerButton
    );

    const reply = await interaction.editReply({
      embeds: [embed],
      components: [firstRow, secondRow],
    });

    await prisma.event.create({
      data: {
        dancers: ``,
        djs: ``,
        hosts: ``,
        security: ``,
        photographers: ``,
        floaters: ``,
        id: reply.id,
        endTime: this.getNextSaturday(),
        guildId: interaction.guildId,
      },
    });

    if (lastEvent) {
      const lastMessage = await interaction.channel?.messages.fetch(
        lastEvent.id
      );
      await lastMessage?.edit({
        embeds: lastMessage?.embeds,
        components: [],
      });
    }
  }

  @ButtonComponent('dancer-button')
  async dancerButton(interaction: ButtonInteraction) {
    const embed = new MessageEmbed(interaction.message.embeds?.[0]);
    const fields = embed.fields ?? [];
    const user = interaction.user.id;

    const result = await prisma.event.findFirst({
      where: { id: interaction.message.id },
    });
    const dancers = this.safeConcat(this.parseUsers(result?.dancers), user);
    const floaters = this.parseUsers(result?.floaters);
    const hosts = this.parseUsers(result?.hosts);
    const security = this.parseUsers(result?.security);
    const djs = this.parseUsers(result?.djs);
    const photographers = this.parseUsers(result?.photographers);
    const endTime = result?.endTime ?? new Date();
    const updatedResults = [
      dancers,
      floaters,
      hosts,
      security,
      djs,
      photographers,
    ];

    await prisma.event.update({
      where: { id: interaction.message.id },
      data: { dancers: dancers.join(' ') },
    });

    embed
      .setFields(
        fields.map((field, index) => {
          field.value = `${updatedResults[index].length}`;
          return field;
        })
      )
      .setDescription(this.formatStaff(updatedResults, endTime));

    interaction.update({ embeds: [embed] });
  }

  @ButtonComponent('floater-button')
  async floaterButton(interaction: ButtonInteraction) {
    const embed = new MessageEmbed(interaction.message.embeds?.[0]);
    const fields = embed.fields ?? [];
    const user = interaction.user.id;

    const result = await prisma.event.findFirst({
      where: { id: interaction.message.id },
    });
    const dancers = this.parseUsers(result?.dancers);
    const floaters = this.safeConcat(this.parseUsers(result?.floaters), user);
    const hosts = this.parseUsers(result?.hosts);
    const security = this.parseUsers(result?.security);
    const djs = this.parseUsers(result?.djs);
    const photographers = this.parseUsers(result?.photographers);
    const endTime = result?.endTime ?? new Date();
    const updatedResults = [
      dancers,
      floaters,
      hosts,
      security,
      djs,
      photographers,
    ];

    await prisma.event.update({
      where: { id: interaction.message.id },
      data: { floaters: floaters.join(' ') },
    });

    embed
      .setFields(
        fields.map((field, index) => {
          field.value = `${updatedResults[index].length}`;
          return field;
        })
      )
      .setDescription(this.formatStaff(updatedResults, endTime));

    interaction.update({ embeds: [embed] });
  }

  @ButtonComponent('host-button')
  async hostButton(interaction: ButtonInteraction) {
    const embed = new MessageEmbed(interaction.message.embeds?.[0]);
    const fields = embed.fields ?? [];
    const user = interaction.user.id;

    const result = await prisma.event.findFirst({
      where: { id: interaction.message.id },
    });
    const dancers = this.parseUsers(result?.dancers);
    const floaters = this.parseUsers(result?.floaters);
    const hosts = this.safeConcat(this.parseUsers(result?.hosts), user);
    const security = this.parseUsers(result?.security);
    const djs = this.parseUsers(result?.djs);
    const photographers = this.parseUsers(result?.photographers);
    const endTime = result?.endTime ?? new Date();
    const updatedResults = [
      dancers,
      floaters,
      hosts,
      security,
      djs,
      photographers,
    ];

    await prisma.event.update({
      where: { id: interaction.message.id },
      data: { hosts: hosts.join(' ') },
    });

    embed
      .setFields(
        fields.map((field, index) => {
          field.value = `${updatedResults[index].length}`;
          return field;
        })
      )
      .setDescription(this.formatStaff(updatedResults, endTime));

    interaction.update({ embeds: [embed] });
  }

  @ButtonComponent('security-button')
  async securityButton(interaction: ButtonInteraction) {
    const embed = new MessageEmbed(interaction.message.embeds?.[0]);
    const fields = embed.fields ?? [];
    const user = interaction.user.id;

    const result = await prisma.event.findFirst({
      where: { id: interaction.message.id },
    });
    const dancers = this.parseUsers(result?.dancers);
    const floaters = this.parseUsers(result?.floaters);
    const hosts = this.parseUsers(result?.hosts);
    const security = this.safeConcat(this.parseUsers(result?.security), user);
    const djs = this.parseUsers(result?.djs);
    const photographers = this.parseUsers(result?.photographers);
    const endTime = result?.endTime ?? new Date();
    const updatedResults = [
      dancers,
      floaters,
      hosts,
      security,
      djs,
      photographers,
    ];

    await prisma.event.update({
      where: { id: interaction.message.id },
      data: { security: security.join(' ') },
    });

    embed
      .setFields(
        fields.map((field, index) => {
          field.value = `${updatedResults[index].length}`;
          return field;
        })
      )
      .setDescription(this.formatStaff(updatedResults, endTime));

    interaction.update({ embeds: [embed] });
  }

  @ButtonComponent('dj-button')
  async djButton(interaction: ButtonInteraction) {
    const embed = new MessageEmbed(interaction.message.embeds?.[0]);
    const fields = embed.fields ?? [];
    const user = interaction.user.id;

    const result = await prisma.event.findFirst({
      where: { id: interaction.message.id },
    });
    const dancers = this.parseUsers(result?.dancers);
    const hosts = this.parseUsers(result?.hosts);
    const floaters = this.parseUsers(result?.floaters);
    const security = this.parseUsers(result?.security);
    const djs = this.safeConcat(this.parseUsers(result?.djs), user);
    const photographers = this.parseUsers(result?.photographers);
    const endTime = result?.endTime ?? new Date();
    const updatedResults = [
      dancers,
      floaters,
      hosts,
      security,
      djs,
      photographers,
    ];

    await prisma.event.update({
      where: { id: interaction.message.id },
      data: { djs: djs.join(' ') },
    });

    embed
      .setFields(
        fields.map((field, index) => {
          field.value = `${updatedResults[index].length}`;
          return field;
        })
      )
      .setDescription(this.formatStaff(updatedResults, endTime));

    interaction.update({ embeds: [embed] });
  }

  @ButtonComponent('photographer-button')
  async photographerButton(interaction: ButtonInteraction) {
    const embed = new MessageEmbed(interaction.message.embeds?.[0]);
    const fields = embed.fields ?? [];
    const user = interaction.user.id;

    const result = await prisma.event.findFirst({
      where: { id: interaction.message.id },
    });
    const dancers = this.parseUsers(result?.dancers);
    const floaters = this.parseUsers(result?.floaters);
    const hosts = this.parseUsers(result?.hosts);
    const security = this.parseUsers(result?.security);
    const djs = this.parseUsers(result?.djs);
    const photographers = this.safeConcat(
      this.parseUsers(result?.photographers),
      user
    );
    const endTime = result?.endTime ?? new Date();
    const updatedResults = [
      dancers,
      floaters,
      hosts,
      security,
      djs,
      photographers,
    ];

    await prisma.event.update({
      where: { id: interaction.message.id },
      data: { photographers: photographers.join(' ') },
    });

    embed
      .setFields(
        fields.map((field, index) => {
          field.value = `${updatedResults[index].length}`;
          return field;
        })
      )
      .setDescription(this.formatStaff(updatedResults, endTime));

    interaction.update({ embeds: [embed] });
  }

  private formatStaff(staffList: string[][], endTime: Date) {
    const formattedStaff = staffList.map((list) => this.formatUsers(list));
    const date = endTime.getTime();
    return `**__Dancers__**\n${formattedStaff[0].join(
      ' '
    )}\n**__Floaters__**\n${formattedStaff[1].join(
      ' '
    )}\n**__Hosts__**\n${formattedStaff[2].join(
      ' '
    )}\n**__Security__**\n${formattedStaff[3].join(
      ' '
    )}\n**__DJs__**\n${formattedStaff[4].join(
      ' '
    )}\n**__Photographers__**\n${formattedStaff[5].join(
      ' '
    )}\n**__Deadline__**\n<t:${Math.round(date / 1000)}:R>`;
  }

  private parseUsers(usersString?: string) {
    return usersString?.split(' ').filter((u) => u.length > 1) ?? [];
  }

  private formatUsers(users: string[]) {
    return users.map((u) => `<@${u}>`);
  }

  private getNextSaturday() {
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    );
    const ESToffset = convertToMilli(4, TIME_UNIT.hours);
    const eventTime =
      //10:30 PM
      convertToMilli(22, TIME_UNIT.hours) +
      convertToMilli(30, TIME_UNIT.minutes);
    //6 === Saturday
    const diffDays = 6 - todayUTC.getUTCDay();
    const diffMs = convertToMilli(diffDays, TIME_UNIT.days) + eventTime;
    const diffUnix = todayUTC.getTime() + diffMs + ESToffset;
    return new Date(diffUnix);
  }

  private safeConcat(target: string[], value: string) {
    if (target?.length > 0) {
      if (target.includes(value)) {
        return target.filter((u) => u !== value);
      } else {
        return target.concat(value);
      }
    }
    return [value];
  }

  private async getCurrentEvent(guildId: string) {
    return await prisma.event.findFirst({
      where: {
        endTime: {
          gt: new Date(),
        },
        guildId,
      },
    });
  }

  private warnUser(interaction: CommandInteraction, event: Event) {
    const cancelButton = new MessageButton()
      .setLabel('Cancel Event')
      .setStyle('DANGER')
      .setCustomId('cancel-button');

    const keepButton = new MessageButton()
      .setLabel('Keep Event')
      .setStyle('SUCCESS')
      .setCustomId('keep-button');

    const row = new MessageActionRow().addComponents(keepButton, cancelButton);

    interaction.reply({
      ephemeral: true,
      content: `There is already an upcoming event scheduled ${
        event.endTime
          ? `<t:${Math.round(event.endTime.getTime() / 1000)}:R>!`
          : '!'
      }\nDo you want to cancel it?`,
      components: [row],
    });
  }

  @ButtonComponent('cancel-button')
  async cancelButton(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;
    const event = await this.getCurrentEvent(interaction.guildId);
    if (!event) return;
    await prisma.event.delete({
      where: {
        id: event?.id,
      },
    });

    await interaction.channel?.messages.delete(
      await interaction.channel?.messages.fetch(event.id)
    );

    interaction.update({
      content: 'Event cancelled!',
      components: [],
    });
  }

  @ButtonComponent('keep-button')
  async confirmButton(interaction: ButtonInteraction) {
    interaction.update({
      content: 'Keeping event.',
      components: [],
    });
  }
}
