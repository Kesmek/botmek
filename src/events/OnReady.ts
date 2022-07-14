import type { ArgsOf, Client } from "discordx";
import { Discord, DIService, On, Once } from "discordx";
import { container, injectable } from "tsyringe";
import type constructor from "tsyringe/dist/typings/types/constructor.js";
import { InteractionUtils } from "../utils/Utils.js";
import { PrismaClient } from "@prisma/client";

@Discord()
@injectable()
export class OnReady {
  public constructor(private _prisma: PrismaClient) {
  }

  public async initAppCommands(client: Client): Promise<void> {
    return await client.initApplicationCommands();
  }

  @Once("ready")
  private async initialize([client]: [Client]) {
    this.initDi();
    await this.initAppCommands(client);
    for (const guildId of client.guilds.cache.keys()) {
      await this._prisma.guild.upsert({
        where: {
          id: guildId,
        },
        create: {
          id: guildId,
        },
        update: {
          id: guildId,
        },
      });
    }
  };

  @On("interactionCreate")
  private async intersectionInit(
    [interaction]: ArgsOf<"interactionCreate">,
    client: Client,
  ): Promise<void> {
    try {
      await client.executeInteraction(interaction);
    } catch (e) {
      console.error(e);
      if (interaction.isApplicationCommand() ||
        interaction.isMessageComponent()) {
        return InteractionUtils.replyOrFollowUp(
          interaction,
          {
            content: `Oops, something went wrong. The best way to report this problem is to contact` +
              ` the bot creator <@211505087653085184> (Kesmek#0001).`,
            ephemeral: true,
          },
        );
      }
    }
  }

  private initDi() {
    const appClasses = DIService.allServices;
    for (const classRef of appClasses) {
      container.resolve(classRef as constructor<any>);
    }
  }
}
