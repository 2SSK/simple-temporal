export const routeTemplate = `
import { Router } from "express";
import { __MODULE_NAME__Controller } from "./__MODULE_NAME__.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { __MODULE_NAME__QuerySchema } from "./__MODULE_NAME__.schema.js";

const __MODULE_NAME__Route = Router();

// Example GET route
__MODULE_NAME__Route.get("/", validate(__MODULE_NAME__QuerySchema, "query"), __MODULE_NAME__Controller);

export default __MODULE_NAME__Route ;
`;
