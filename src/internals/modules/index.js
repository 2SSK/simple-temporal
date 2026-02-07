import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const loadModules = async () => {
  const dirs = fs.readdirSync(__dirname).filter((dir) => dir !== "index.js");

  const modules = await Promise.all(
    dirs.map(async (dir) => {
      const modulePath = `./${dir}/${dir}.route.js`;
      const m = await import(modulePath);

      return {
        path: `/${dir}`,
        router: m.default,
      };
    }),
  );

  return modules;
};
