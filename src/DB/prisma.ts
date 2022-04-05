import PrismaClientPkg from '@prisma/client';
const { PrismaClient } = PrismaClientPkg;

const prisma = {
  client: new PrismaClient(),
};
const client = prisma.client;

type GuildType = PrismaClientPkg.Guild;
type GuildUpsertType = PrismaClientPkg.Prisma.GuildUpsertArgs;
type CommandType = PrismaClientPkg.Command;
type CommandUpsertType = PrismaClientPkg.Prisma.CommandUpsertArgs;
type EventType = PrismaClientPkg.Event;
type EventUpsertType = PrismaClientPkg.Prisma.EventUpsertArgs;
type Repositories = {
  guild: GuildType;
  command: CommandType;
  event: EventType;
};

export { client as prisma };
export type {
  GuildType,
  CommandType,
  EventType,
  Repositories,
  GuildUpsertType,
  CommandUpsertType,
  EventUpsertType,
};
