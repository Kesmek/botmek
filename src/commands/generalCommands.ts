import { CommandInteraction } from 'discord.js';
import { Utils } from '../utils/utils.js';
import InteractionUtils = Utils.InteractionUtils;

const errorReply = async (interaction: CommandInteraction) => {
  InteractionUtils.replyOrFollowUp(
    interaction,
    'Error: Something went wrong, please try again later. If this error persists, please contact the bot owner <@211505087653085184>.',
    true
  );
};

export { errorReply };
