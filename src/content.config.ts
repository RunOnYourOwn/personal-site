import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      // Enhanced blog schema
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Project links
      link: z.string().url().optional(),
      repo: z.string().url().optional(),
      // Project metadata
      year: z.number().optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      heroImage: image().optional(),
      // Project status
      status: z
        .enum(["completed", "in-progress", "archived"])
        .default("completed"),
    }),
});

export const collections = { blog, projects };
