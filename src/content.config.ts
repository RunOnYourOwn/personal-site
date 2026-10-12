import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
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
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
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
        .enum(['completed', 'in-progress', 'archived'])
        .default('completed'),
    }),
});

export const collections = { blog, projects };
