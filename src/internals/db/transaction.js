import { prisma } from "./prisma.js";

export const withTransaction = async (fn) => {
  return prisma.$transaction(fn);
};
