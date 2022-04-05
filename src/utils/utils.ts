import {
  BaseCommandInteraction,
  MessageComponentInteraction,
} from 'discord.js';

export namespace Utils {
  export namespace InteractionUtils {
    export function replyOrFollowUp(
      interaction: BaseCommandInteraction | MessageComponentInteraction,
      content: string,
      ephemeral: boolean = false
    ): Promise<void> {
      if (interaction.replied) {
        return interaction.followUp({
          ephemeral,
          content,
        }) as unknown as Promise<void>;
      }
      if (interaction.deferred) {
        return interaction.editReply(content) as unknown as Promise<void>;
      }
      return interaction.reply({
        ephemeral,
        content,
      });
    }
  }
}

export namespace TimeUtils {
  export enum TIME_UNIT {
    milliseconds = 'ms',
    seconds = 's',
    minutes = 'm',
    hours = 'h',
    days = 'd',
    weeks = 'w',
    months = 'mo',
    years = 'y',
  }

  export function convertToMilli(value: number, unit: TIME_UNIT): number {
    switch (unit) {
      case TimeUtils.TIME_UNIT.seconds:
        return value * 1000;
      case TimeUtils.TIME_UNIT.minutes:
        return value * 60000;
      case TimeUtils.TIME_UNIT.hours:
        return value * 3600000;
      case TimeUtils.TIME_UNIT.days:
        return value * 86400000;
      case TimeUtils.TIME_UNIT.weeks:
        return value * 604800000;
      case TimeUtils.TIME_UNIT.months:
        return value * 2629800000;
      case TimeUtils.TIME_UNIT.years:
        return value * 31556952000;
      default:
        return 1000;
    }
  }
}
