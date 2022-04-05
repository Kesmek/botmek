import { Guild } from 'discord.js';
import { ArgsOf, Client, Discord, On } from 'discordx';
import {
  RoleListener,
  RoleTypes,
  RoleUpdateTrigger,
} from '../events/listeners/roleEventListener';
import { singleton } from 'tsyringe';

@Discord()
@singleton()
export class CommandManager implements RoleListener {
  @On('roleCreate')
  private async roleCreated([role]: ArgsOf<'roleCreate'>, client: Client) {
    return this.trigger([role], 'roleCreate', client);
  }

  @On('roleDelete')
  private async roleDeleted([role]: ArgsOf<'roleDelete'>, client: Client) {
    return this.trigger([role], 'roleDelete', client);
  }

  @On('roleUpdate')
  private async roleUpdated(
    [oldRole, newRole]: ArgsOf<'roleUpdate'>,
    client: Client
  ) {
    return this.trigger([oldRole, newRole], 'roleUpdate', client);
  }

  public async trigger(
    [oldRole, newRole]: RoleUpdateTrigger,
    type: RoleTypes,
    client: Client
  ): Promise<void> {
    const { guild } = oldRole;
    if (type === 'roleUpdate') {
      if (!newRole) return;
      // was it a role that was removed/added to admin?
      const added = oldRole.permissions.missing(newRole?.permissions.bitfield);
      const removed = newRole.permissions.missing(oldRole.permissions.bitfield);
      if (
        !(added.includes('ADMINISTRATOR') || removed.includes('ADMINISTRATOR'))
      ) {
        return;
      }
    }
    return this.initGuildApplicationPermissions(guild, client);
  }

  public async initGuildApplicationPermissions(
    guild: Guild,
    client: Client
  ): Promise<void> {
    console.log(`Reloading command permissions for guild: "${guild.name}"`);
    const commands = (await client.CommandByGuild()).get(guild.id);
    await client.initGuildApplicationCommands(guild.id, commands ?? []);
    console.log(`Permissions for guild ${guild.name} has been reloaded`);
  }
}
