import { ButtonComponent, Discord, Guard } from "discordx";
import { ButtonInteraction } from "discord.js";
import { PrismaClient, ScheduledEvent } from "@prisma/client";
import { EmbedUtils } from "../utils/Utils.js";
import { IsRegisterable } from "../guards/IsRegisterable.js";
import { injectable } from "tsyringe";

@Discord()
@injectable()
export class Registration {
  constructor(private _prisma: PrismaClient) {
  }

  @ButtonComponent("dancer-button")
  @Guard(IsRegisterable)
  async dancerHandler(interaction: ButtonInteraction) {
    const eventInfo = await this._prisma.scheduledEvent.findFirst({
      where: {
        messageId: interaction.message.id,
      },
    });
    const { Dancers, ...rest } = this.getStaff(eventInfo);

    let newDancers: string[];
    if (Dancers.includes(interaction.user.id)) {
      newDancers = Dancers.filter((dancer) => dancer !== interaction.user.id);
    } else {
      newDancers = Dancers.concat([interaction.user.id]);
    }
    const embed = await EmbedUtils.editSignupEmbed(
      this.orderStaff({ Dancers: newDancers, ...rest }),
      interaction,
    );
    await interaction.update({ embeds: [embed] });

    await this._prisma.scheduledEvent.update({
      where: {
        messageId: interaction.message.id,
      },
      data: {
        dancers: JSON.stringify(newDancers),
      },
    });
  }

  @ButtonComponent("floater-button")
  @Guard(IsRegisterable)
  async floaterHandler(interaction: ButtonInteraction) {
    const eventInfo = await this._prisma.scheduledEvent.findFirst({
      where: {
        messageId: interaction.message.id,
      },
    });
    const { Floaters, ...rest } = this.getStaff(eventInfo);

    let newFloaters: string[];
    if (Floaters.includes(interaction.user.id)) {
      newFloaters = Floaters.filter((dancer) => dancer !== interaction.user.id);
    } else {
      newFloaters = Floaters.concat([interaction.user.id]);
    }
    const embed = await EmbedUtils.editSignupEmbed(
      this.orderStaff({ Floaters: newFloaters, ...rest }),
      interaction,
    );
    await interaction.update({ embeds: [embed] });

    await this._prisma.scheduledEvent.update({
      where: {
        messageId: interaction.message.id,
      },
      data: {
        floaters: JSON.stringify(newFloaters),
      },
    });
  }

  @ButtonComponent("host-button")
  @Guard(IsRegisterable)
  async hostHandler(interaction: ButtonInteraction) {
    const eventInfo = await this._prisma.scheduledEvent.findFirst({
      where: {
        messageId: interaction.message.id,
      },
    });
    const { Hosts, ...rest } = this.getStaff(eventInfo);

    let newHosts: string[];
    if (Hosts.includes(interaction.user.id)) {
      newHosts = Hosts.filter((dancer) => dancer !== interaction.user.id);
    } else {
      newHosts = Hosts.concat([interaction.user.id]);
    }
    const embed = await EmbedUtils.editSignupEmbed(
      this.orderStaff({ Hosts: newHosts, ...rest }),
      interaction,
    );
    await interaction.update({ embeds: [embed] });

    await this._prisma.scheduledEvent.update({
      where: {
        messageId: interaction.message.id,
      },
      data: {
        hosts: JSON.stringify(newHosts),
      },
    });
  }

  @ButtonComponent("security-button")
  @Guard(IsRegisterable)
  async securityHandler(interaction: ButtonInteraction) {
    const eventInfo = await this._prisma.scheduledEvent.findFirst({
      where: {
        messageId: interaction.message.id,
      },
    });
    const { Security, ...rest } = this.getStaff(eventInfo);

    let newSecurity: string[];
    if (Security.includes(interaction.user.id)) {
      newSecurity = Security.filter((dancer) => dancer !== interaction.user.id);
    } else {
      newSecurity = Security.concat([interaction.user.id]);
    }
    const embed = await EmbedUtils.editSignupEmbed(
      this.orderStaff({ Security: newSecurity, ...rest }),
      interaction,
    );
    await interaction.update({ embeds: [embed] });

    await this._prisma.scheduledEvent.update({
      where: {
        messageId: interaction.message.id,
      },
      data: {
        security: JSON.stringify(newSecurity),
      },
    });
  }

  @ButtonComponent("dj-button")
  @Guard(IsRegisterable)
  async djHandler(interaction: ButtonInteraction) {
    const eventInfo = await this._prisma.scheduledEvent.findFirst({
      where: {
        messageId: interaction.message.id,
      },
    });
    const { DJs, ...rest } = this.getStaff(eventInfo);

    let newDJs: string[];
    if (DJs.includes(interaction.user.id)) {
      newDJs = DJs.filter((dancer) => dancer !== interaction.user.id);
    } else {
      newDJs = DJs.concat([interaction.user.id]);
    }
    const embed = await EmbedUtils.editSignupEmbed(
      this.orderStaff({ DJs: newDJs, ...rest }),
      interaction,
    );
    await interaction.update({ embeds: [embed] });

    await this._prisma.scheduledEvent.update({
      where: {
        messageId: interaction.message.id,
      },
      data: {
        djs: JSON.stringify(newDJs),
      },
    });
  }

  @ButtonComponent("photographer-button")
  @Guard(IsRegisterable)
  async photographerHandler(interaction: ButtonInteraction) {
    const eventInfo = await this._prisma.scheduledEvent.findFirst({
      where: {
        messageId: interaction.message.id,
      },
    });
    const { Photographers, ...rest } = this.getStaff(eventInfo);

    let newPhotographers: string[];
    if (Photographers.includes(interaction.user.id)) {
      newPhotographers
        = Photographers.filter((dancer) => dancer !== interaction.user.id);
    } else {
      newPhotographers = Photographers.concat([interaction.user.id]);
    }
    const embed = await EmbedUtils.editSignupEmbed(
      this.orderStaff({ Photographers: newPhotographers, ...rest }),
      interaction,
    );
    await interaction.update({ embeds: [embed] });

    await this._prisma.scheduledEvent.update({
      where: {
        messageId: interaction.message.id,
      },
      data: {
        photographers: JSON.stringify(newPhotographers),
      },
    });
  }

  private getStaff(event: ScheduledEvent | null) {
    const dancers = this.parseMaybeJSON(event?.dancers);
    const floaters = this.parseMaybeJSON(event?.floaters);
    const hosts = this.parseMaybeJSON(event?.hosts);
    const security = this.parseMaybeJSON(event?.security);
    const djs = this.parseMaybeJSON(event?.djs);
    const photographers = this.parseMaybeJSON(event?.photographers);
    return {
      Dancers: dancers,
      Floaters: floaters,
      Hosts: hosts,
      Security: security,
      DJs: djs,
      Photographers: photographers,
    };
  }

  private orderStaff(staff: ReturnType<typeof this.getStaff>) {
    return {
      Dancers: staff.Dancers,
      Floaters: staff.Floaters,
      Hosts: staff.Hosts,
      Security: staff.Security,
      DJs: staff.DJs,
      Photographers: staff.Photographers,
    };
  }

  private parseMaybeJSON(usersString?: string | null) {
    return usersString ? JSON.parse(usersString) as string[] : [];
  }
}
