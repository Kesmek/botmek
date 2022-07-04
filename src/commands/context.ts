import { ContextMenuInteraction } from "discord.js";
import { ContextMenu, Discord } from "discordx";
import { injectable } from "tsyringe";
import { PrismaClient } from "@prisma/client";

@Discord()
@injectable()
export class Context {
  constructor(private _prisma: PrismaClient) {
  }

  @ContextMenu("MESSAGE", "Get Event Info")
  async messageHandler(interaction: ContextMenuInteraction) {
    const events = await this._prisma.scheduledEvent.findFirst({
      where: {
        messageId: interaction.targetId,
      },
    });
    console.log(events);
    await interaction.reply({
      content: "Check Logs",
      ephemeral: true,
    });
  }

  //
  // @ContextMenu("USER", "user context")
  // userHandler(interaction: ContextMenuInteraction): void {
  //   interaction.reply("I am user context handler");
  // }
}
