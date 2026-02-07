import { Router } from "express";
import { loadModules } from "../modules/index.js";

const v1Router = Router();

export const initV1Routes = async () => {
  const modules = await loadModules();

  modules.forEach(({ path, router }) => {
    v1Router.use(path, router);
  });

  return v1Router;
};
