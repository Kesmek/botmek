import PrismaClientPkg from '@prisma/client';
const { PrismaClient } = PrismaClientPkg;

const prisma = {
  client: new PrismaClient(),
};
const client = prisma.client;

export { client as prisma };
