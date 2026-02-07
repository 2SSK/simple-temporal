import fs from "fs";
import path from "path";
import { controllerTemplate } from "./templates/controller.js";
import { serviceTemplate } from "./templates/service.js";
import { schemaTemplate } from "./templates/schema.js";
import { routeTemplate } from "./templates/route.js";
import { repositoryTemplate } from "./templates/repository.js";
import { logInfo, logError } from "../src/internals/utils/logger.js";

const moduleName = process.argv[2];
if (!moduleName) {
  logError("Please provide a module name");
  process.exit(1);
}

const moduleDir = path.join("src", "internals", "modules", moduleName);

if (!fs.existsSync(moduleDir)) {
  fs.mkdirSync(moduleDir, { recursive: true });
}

const fillTemplate = (template) =>
  template.replace(/__MODULE_NAME__/g, moduleName);

const templates = {
  controller: fillTemplate(controllerTemplate),
  service: fillTemplate(serviceTemplate),
  schema: fillTemplate(schemaTemplate),
  route: fillTemplate(routeTemplate),
  repository: fillTemplate(repositoryTemplate),
};

for (const [file, content] of Object.entries(templates)) {
  fs.writeFileSync(path.join(moduleDir, `${moduleName}.${file}.js`), content);
}

logInfo(`Module "${moduleName}" created successfully!`);
