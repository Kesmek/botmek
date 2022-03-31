import {
  ButtonInteraction,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { ButtonComponent, Discord, Permission, Slash } from 'discordx';

@Discord()
@Permission(false)
@Permission({ type: 'ROLE', permission: true, id: '949834489146798160' }) //TEST-SERVER 18+ ROLE
@Permission({ type: 'ROLE', permission: true, id: '950518180525269123' }) //Atlantis Owner
@Permission({ type: 'ROLE', permission: true, id: '950518180525269122' }) //Atlantis Co-Owner
@Permission({ type: 'ROLE', permission: true, id: '950518180504272903' }) //Atlantis Head Admin
@Permission({ type: 'ROLE', permission: true, id: '950518180466528345' }) //Atlantis Dance Captain
@Permission({ type: 'ROLE', permission: true, id: '950518180504272900' }) //Atlantis Host
export class StaffCommands {
  private dancers: string[] = [];
  private hosts: string[] = [];
  private security: string[] = [];
  private DJs: string[] = [];
  private photographers: string[] = [];
  private timestamp = 0;

  @Slash('setup-registration')
  async setupRegistration(interaction: CommandInteraction) {
    await interaction.deferReply();

    this.resetFields();
    this.timestamp = Math.round(this.getNextSaturday().getTime() / 1000);

    const embed = new MessageEmbed()
      .addFields([
        { name: 'Dancers', value: '0', inline: true },
        { name: 'Hosts', value: '0', inline: true },
        { name: 'Security', value: '0', inline: true },
        { name: 'DJs', value: '0', inline: true },
        { name: 'Photographers', value: '0', inline: true },
      ])
      .setDescription(this.formatStaff())
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

    const row = new MessageActionRow().addComponents(
      dancerButton,
      hostButton,
      securityButton,
      djButton,
      photographerButton
    );

    interaction.editReply({
      embeds: [embed],
      components: [row],
    });
  }

  @ButtonComponent('dancer-button')
  async dancerButton(interaction: ButtonInteraction) {
    const embed = new MessageEmbed(interaction.message.embeds?.[0]);
    const fields = embed.fields ?? [];
    const user = `<@${interaction.user.id}>`;
    const included = this.dancers.includes(user);

    let dancers = this.dancers.filter((dancer) => {
      return dancer !== user;
    });
    if (!included) {
      dancers.push(user);
    }

    embed.setFields(
      fields.map((field) => {
        if (field.name === 'Dancers') {
          field.value = `${dancers.length}`;
        }
        return field;
      })
    );
    this.dancers = dancers;
    embed.setDescription(this.formatStaff());

    interaction.update({ embeds: [embed] });
  }

  @ButtonComponent('host-button')
  async hostButton(interaction: ButtonInteraction) {
    const embed = new MessageEmbed(interaction.message.embeds?.[0]);
    const fields = embed.fields ?? [];
    const user = `<@${interaction.user.id}>`;
    const included = this.hosts.includes(user);
    let hosts = this.hosts.filter((host) => {
      return host !== user;
    });
    if (!included) {
      hosts.push(user);
    }

    embed.setFields(
      fields.map((field) => {
        if (field.name === 'Hosts') {
          field.value = `${hosts.length}`;
        }
        return field;
      })
    );
    this.hosts = hosts;
    embed.setDescription(this.formatStaff());

    interaction.update({ embeds: [embed] });
  }

  @ButtonComponent('security-button')
  async securityButton(interaction: ButtonInteraction) {
    const embed = new MessageEmbed(interaction.message.embeds?.[0]);
    const fields = embed.fields ?? [];
    const user = `<@${interaction.user.id}>`;
    const included = this.security.includes(user);
    let security = this.security.filter((sec) => {
      return sec !== user;
    });
    if (!included) {
      security.push(user);
    }

    embed.setFields(
      fields.map((field) => {
        if (field.name === 'Security') {
          field.value = `${security.length}`;
        }
        return field;
      })
    );
    this.security = security;
    embed.setDescription(this.formatStaff());

    interaction.update({ embeds: [embed] });
  }

  @ButtonComponent('dj-button')
  async djButton(interaction: ButtonInteraction) {
    const embed = new MessageEmbed(interaction.message.embeds?.[0]);
    const fields = embed.fields ?? [];
    const user = `<@${interaction.user.id}>`;
    const included = this.DJs.includes(user);
    let DJs = this.DJs.filter((DJ) => {
      return DJ !== user;
    });
    if (!included) {
      DJs.push(user);
    }

    embed.setFields(
      fields.map((field) => {
        if (field.name === 'DJs') {
          field.value = `${DJs.length}`;
        }
        return field;
      })
    );
    this.DJs = DJs;
    embed.setDescription(this.formatStaff());

    interaction.update({ embeds: [embed] });
  }

  @ButtonComponent('photographer-button')
  async photographerButton(interaction: ButtonInteraction) {
    const embed = new MessageEmbed(interaction.message.embeds?.[0]);
    const fields = embed.fields ?? [];
    const user = `<@${interaction.user.id}>`;
    const included = this.photographers.includes(user);
    let photographers = this.photographers.filter((photographer) => {
      return photographer !== user;
    });
    if (!included) {
      photographers.push(user);
    }

    embed.setFields(
      fields.map((field) => {
        if (field.name === 'Photographers') {
          field.value = `${photographers.length}`;
        }
        return field;
      })
    );
    this.photographers = photographers;
    embed.setDescription(this.formatStaff());

    interaction.update({ embeds: [embed] });
  }

  private resetFields() {
    this.dancers = [];
    this.DJs = [];
    this.security = [];
    this.hosts = [];
    this.photographers = [];
    this.timestamp = Date.now();
  }

  private formatStaff() {
    return `**__Dancers__**\n${this.dancers.join(
      ' '
    )}\n**__Hosts__**\n${this.hosts.join(
      ' '
    )}\n**__Security__**\n${this.security.join(
      ' '
    )}\n**__DJs__**\n${this.DJs.join(
      ' '
    )}\n**__Photographers__**\n${this.photographers.join(
      ' '
    )}\n**__Event Scheduled__**\n<t:${this.timestamp}:R>`;
  }

  private getNextSaturday() {
    const today = new Date();
    today.setHours(0, 0, 0);
    //6 === Saturday
    const diffDays = 6 - today.getDay();
    const diffMs = diffDays * 24 * 3600 * 1000;
    const diffUnix = today.getTime() + diffMs;
    const saturday = new Date(diffUnix);
    saturday.setHours(22);
    return saturday;
  }
}
