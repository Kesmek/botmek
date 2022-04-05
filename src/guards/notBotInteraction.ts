import { GuardFunction, SimpleCommandMessage } from 'discordx';
import { CommandInteraction, DMChannel, Message } from 'discord.js';

export const NotBotInteraction: GuardFunction<
  CommandInteraction | SimpleCommandMessage
> = async (arg, client, next) => {
  //Necessary for typescript to know that arg is a CommandInteraction
  if (arg instanceof SimpleCommandMessage) {
    if (await notBot(arg.message)) {
      await next();
    }
  } else {
    if (!arg?.member?.user?.bot) {
      await next();
    }
  }
};

export async function notBot(
  message: Message | CommandInteraction
): Promise<boolean> {
  return message.channel instanceof DMChannel
    ? false
    : !message?.member?.user?.bot;
}
