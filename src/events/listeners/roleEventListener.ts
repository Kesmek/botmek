import { ArgsOf, Client } from 'discordx';

type RoleUpdateTrigger =
  | ArgsOf<'roleUpdate'>
  | ArgsOf<'roleCreate'>
  | ArgsOf<'roleDelete'>;
type RoleTypes = 'roleUpdate' | 'roleCreate' | 'roleDelete';

interface RoleListener {
  /**
   * Will trigger when there is a role addition, modification or deletion
   * @param event
   * @param type
   */
  trigger(
    event: RoleUpdateTrigger,
    type: RoleTypes,
    client: Client
  ): Promise<void>;
}

export type { RoleUpdateTrigger, RoleTypes, RoleListener };
