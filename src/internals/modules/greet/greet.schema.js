import { z } from "zod";

export const greetBodySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
  }),
});
