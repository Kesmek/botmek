import { GuardFunction } from "discordx";
import {
  ButtonInteraction, Collection, CommandInteraction, GuildMember,
} from "discord.js";
import { GuildUtils, InteractionUtils } from "../utils/Utils.js";
import { container } from "tsyringe";
import { PrismaClient } from "@prisma/client";

export const IsUnverified: GuardFunction<ButtonInteraction> = async (
  arg,
  client,
  next,
) => {
  const member = arg.member as GuildMember;
  if (member.roles.cache.size < 2) {
    await next();
  } else {
    await InteractionUtils.replyOrFollowUp(arg, {
      content: "You are already verified!",
      ephemeral: true,
    });
  }
};

export const IsVerificationSetup: GuardFunction<CommandInteraction | ButtonInteraction> = async (
  arg,
  client,
  next,
) => {
  const _prisma = container.resolve(PrismaClient);
  const guildInfo = await _prisma.guild.findFirst({
    where: {
      id: arg.guild?.id,
    },
  });
  if (guildInfo?.verifiedRole && guildInfo.verificationCategory) {
    await next();
  } else {
    await InteractionUtils.replyOrFollowUp(arg, {
      content: "You must setup verification first with `/setup-verification`!",
      ephemeral: true,
    });
  }
};

export const IsAdmin: GuardFunction<ButtonInteraction> = async (
  arg,
  client,
  next,
) => {
  const admins = await GuildUtils.getAdmins(arg) as Collection<string, GuildMember>;
  const isAdmin = admins.has(arg.user.id);
  if (isAdmin) {
    await next();
  } else {
    await InteractionUtils.replyOrFollowUp(arg, {
      content: "Only an admin may use this!",
      ephemeral: true,
    });
  }
};
