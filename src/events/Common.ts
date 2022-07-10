import type { ArgsOf } from "discordx";
import { Discord, On } from "discordx";
import { EmbedUtils } from "../utils/Utils.js";
import { MessageActionRow, MessageButton, TextChannel } from "discord.js";
import { injectable } from "tsyringe";
import { PrismaClient } from "@prisma/client";
import { TimeUnits } from "../utils/Constants.js";

@Discord()
@injectable()
export class Common {
  constructor(private _prisma: PrismaClient) {
  }

  @On("guildMemberRemove")
  private async memberRemoved(
    [member]: ArgsOf<"guildMemberRemove">,
  ) {
    const channel = member.guild.channels.cache.find((channel) => channel.name === member.user.id);
    if (channel) {
      await member.guild?.channels.delete(channel, "User left the server");
    }
  }

  @On("guildScheduledEventCreate")
  private async eventCreated(
    [event]: ArgsOf<"guildScheduledEventCreate">,
  ) {
    const guildInfo = await this._prisma.guild.findFirst({
      where: {
        id: event.guildId,
      },
    });
    const signupChannel = guildInfo?.signupChannel;
    const staffRole = guildInfo?.staffRole;
    if (signupChannel) {
      const dancerButton = new MessageButton()
      .setLabel("Dancer")
      .setStyle("PRIMARY")
      .setCustomId("dancer-button")
      .setEmoji("💃");

      const floaterButton = new MessageButton()
      .setLabel("Floater")
      .setStyle("PRIMARY")
      .setCustomId("floater-button")
      .setEmoji("🕴");

      const hostButton = new MessageButton()
      .setLabel("Host")
      .setStyle("PRIMARY")
      .setCustomId("host-button")
      .setEmoji("🎤");

      const securityButton = new MessageButton()
      .setLabel("Security")
      .setStyle("PRIMARY")
      .setCustomId("security-button")
      .setEmoji("🛡");

      const djButton = new MessageButton()
      .setLabel("DJ")
      .setStyle("PRIMARY")
      .setCustomId("dj-button")
      .setEmoji("🎶");

      const photographerButton = new MessageButton()
      .setLabel("Photographer")
      .setStyle("PRIMARY")
      .setCustomId("photographer-button")
      .setEmoji("📸");

      const row1 = new MessageActionRow().addComponents(
        dancerButton,
        floaterButton,
        hostButton,
      );
      const row2 = new MessageActionRow().addComponents(
        securityButton,
        djButton,
        photographerButton,
      );

      const embed = EmbedUtils.createSignupEmbed([event]);
      const channel = event.guild?.channels.cache.get(signupChannel) as TextChannel;
      const message = await channel.send({
        embeds: [embed],
        content: `<@&${staffRole}> Signups are open!\nPlease register for a position as soon as ` +
          `possible so the organizers can plan everything appropriately.\nThis event is scheduled to` +
          ` start on <t:${Math.round(event.scheduledStartTimestamp! / 1000)}>` +
          `(<t:${Math.round(event.scheduledStartTimestamp! / 1000)}:R>)\n\n` +
          `**Note:** Registrations close 12 hours before the start of the event ` +
          `(<t:${Math.round((event.scheduledStartTimestamp! - TimeUnits.Hour * 12) / 1000)}:R>).`,
        components: [row1, row2],
      });

      await this._prisma.scheduledEvent.create({
        data: {
          id: event.id,
          guildId: event.guildId,
          messageId: message.id,
        },
      });
    } else {
      console.warn("Setup has not been performed!");
    }
  }

  @On("guildScheduledEventUpdate")
  private async eventUpdated(
    [oldEvent, newEvent]: ArgsOf<"guildScheduledEventUpdate">,
  ) {
    if (newEvent.isActive()) {
      const guildInfo = await this._prisma.guild.findFirst({
        where: {
          id: newEvent.guildId,
        },
      });
      const updatedEvent = await this._prisma.scheduledEvent.findFirst({
        where: {
          id: oldEvent.id,
        },
      });
      const signupChannel = newEvent.guild?.channels.cache.get(guildInfo?.signupChannel!) as TextChannel;
      const message = signupChannel.messages.cache.get(updatedEvent?.messageId!);
      await message?.edit({ components: [] });
    }
    if (newEvent.isCompleted() || newEvent.isCanceled()) {
      try {
        await this._prisma.scheduledEvent.delete({
          where: {
            id: oldEvent.id,
          },
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  @On("guildScheduledEventDelete")
  private async eventDelete(
    [event]: ArgsOf<"guildScheduledEventDelete">,
  ) {
    try {
      const deletedEvent = await this._prisma.scheduledEvent.delete({
        where: {
          id: event.id,
        },
      });
      const guildInfo = await this._prisma.guild.findFirst({
        where: {
          id: event.guildId,
        },
      });
      const signupChannel = event.guild?.channels.cache.get(guildInfo?.signupChannel!) as TextChannel;
      await signupChannel.messages.delete(deletedEvent.messageId);
    } catch (e) {
      console.error(e);
    }
  }
}
