import { Interaction } from "discord.js";
import { GuildUtils } from "./Utils.js";

export const MinorKickedMessage = async (interaction: Interaction) => {
  const adminsString = GuildUtils.stringifyMembers(await GuildUtils.getAdmins(
    interaction));
  return "Hello!\n\nUnfortunately you've been kicked" +
    " from **" + interaction.guild?.name + "** for being a minor. You are" +
    " welcome to rejoin once you are 18+. There are no exceptions to this" +
    " rule. If you disagree with this action, please contact one of our" +
    " admins: " + adminsString + ". If you rejoin the server before you are" +
    " 18 and *without* contacting them first, it __will__ result in a" +
    " ban.\n\nThank you, have a great day.";
};

export const VerificationSetupMessage = (helpChannel?: boolean) => {
  return "Please press the *verify* button to begin the" +
    " verification process or press the *minor* button if you are a" +
    " minor." + (helpChannel
      ? " If you need help, please press the" +
      " *help* button and you'll be redirected to a channel where you" +
      " can ask for assistance."
      : "");
};

export enum ModerationActions {
  Promotion = "Promoted User ⬆",
  Verification = "Verified User ✅",
}
