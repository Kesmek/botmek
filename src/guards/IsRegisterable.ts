import { GuardFunction } from "discordx";
import { ButtonInteraction, Message } from "discord.js";
import { InteractionUtils } from "../utils/Utils.js";
import { container } from "tsyringe";
import { PrismaClient } from "@prisma/client";
import { TimeUnits } from "../utils/Constants.js";

export const IsRegisterable: GuardFunction<ButtonInteraction> = async (
  arg,
  client,
  next,
) => {
  try {
    const _prisma = container.resolve(PrismaClient);
    const scheduledEvent = await _prisma.scheduledEvent.findFirst({
      where: {
        messageId: arg.message.id,
      },
    });
    const event = await arg.guild?.scheduledEvents.fetch(scheduledEvent?.id!);
    if (scheduledEvent && event?.isScheduled()) {
      const deadline = new Date(event?.scheduledStartAt!);
      //12 Hours in advance
      deadline.setTime(deadline.getTime() - TimeUnits.Hour * 12);
      if (deadline.getTime() < Date.now()) {
        await (arg.message as Message).edit({ components: [] });
        return await InteractionUtils.replyOrFollowUp(arg, {
          content: "The registration deadline has passed. Sign ups are closed.",
          ephemeral: true,
        });
      }
      await next();
    } else {
      await arg.update({ ...arg, components: [] });
      await InteractionUtils.replyOrFollowUp(arg, {
        content: "This event has already started or completed!",
        ephemeral: true,
      });
    }
  } catch (e) {
    console.error(e);
  }
};
