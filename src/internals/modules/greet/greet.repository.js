import { prisma } from "../../db/prisma.js";

export const greetRepository = {
  createGreeting: (data) => prisma.greeting.create({ data }),
  findAll: () => prisma.greeting.findMany(),
};
