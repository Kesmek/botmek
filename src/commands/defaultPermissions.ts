import { ApplicationCommandPermissions, Guild, Permissions } from 'discord.js';
import { ApplicationCommandMixin, SimpleCommandMessage } from 'discordx';

const getDefaultPermissions = async (
  guild: Guild,
  cmd: ApplicationCommandMixin | SimpleCommandMessage
): Promise<ApplicationCommandPermissions[]> => {
  const adminRoles = await getAdminRoles(guild, cmd);
  return [
    {
      type: 'ROLE',
      permission: true,
      id: '950518180466528345',
    } as ApplicationCommandPermissions, //Paradox Dance Captain
    {
      type: 'ROLE',
      permission: true,
      id: '950518180504272900',
    } as ApplicationCommandPermissions, //Paradox Host
    {
      type: 'ROLE',
      permission: true,
      id: '960248797890494474',
    } as ApplicationCommandPermissions, //Paradox Head Host
  ].concat(adminRoles);
};

const getAdminRoles = async (
  guild: Guild,
  cmd: ApplicationCommandMixin | SimpleCommandMessage
): Promise<ApplicationCommandPermissions[]> => {
  return guild.roles.cache
    .filter((role) =>
      role.permissions.has(
        [Permissions.FLAGS.ADMINISTRATOR, Permissions.FLAGS.BAN_MEMBERS],
        true
      )
    )
    .map(
      (role) =>
        ({
          type: 'ROLE',
          permission: true,
          id: role.id,
        } as ApplicationCommandPermissions)
    );
};

export { getDefaultPermissions };
