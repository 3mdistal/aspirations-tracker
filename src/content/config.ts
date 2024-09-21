import { defineCollection, z } from "astro:content";
import { gitHubLoader } from "../lib/github";

const tasks = defineCollection({
  loader: gitHubLoader(),
  schema: z
    .object({
      id: z.string(),
      title: z.string(),
      frontmatter: z.any(),
      content: z.string(),
    })
    .strict(),
});

export const collections = {
  tasks,
};
