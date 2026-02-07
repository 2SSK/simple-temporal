export const repositoryTemplate = `
import { prisma } from "../../db/prisma.js";

export const __MODULE_NAME__Repository = {
  create(data){
    return prisma.__MODULE_NAME__.create({data});
  },

  findAll(){
    return prisma.__MODULE_NAME__.findMany();
  }
};
`;
