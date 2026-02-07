import { Router } from "express";
import { greetController, greetGetAllController } from "./greet.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { greetBodySchema } from "./greet.schema.js";

const greetRouter = Router();

greetRouter.post("/", validate(greetBodySchema), greetController);
greetRouter.get("/", greetGetAllController);

export default greetRouter;
