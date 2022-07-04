import { GuardFunction } from "discordx";
import { ButtonInteraction } from "discord.js";
import { container } from "tsyringe";
import { PrismaClient } from "@prisma/client";
import { InteractionUtils } from "../utils/Utils.js";

export const IsApplicationSetup: GuardFunction<ButtonInteraction> = async (
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
  if (guildInfo?.applicationChannel) {
    await next();
  } else {
    await InteractionUtils.replyOrFollowUp(arg, {
      content: "You must setup applications first with `/setup-applications`!",
      ephemeral: true,
    });
  }
};
