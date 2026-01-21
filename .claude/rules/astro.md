# Astro Development Rules

These rules apply to Astro components, layouts, and pages in `src/`.

## Astro Patterns

### Component Structure

- **Use `.astro` files** for static components (zero JS by default)
- **Use frontmatter** for server-side logic (runs at build time)
- **Keep client-side JS minimal** - Astro's strength is zero-JS output
- Example:

  ```astro
  ---
  // Frontmatter: runs at build time
  import { getCollection } from 'astro:content';
  const posts = await getCollection('blog');
  ---

  <!-- Template: renders to static HTML -->
  <ul>
    {posts.map(post => <li>{post.data.title}</li>)}
  </ul>
  ```

### Client-Side Interactivity

- **Use `<script>` tags** for page-specific JS
- **Inline scripts preferred** - Bundled automatically by Astro
- **Event delegation** for dynamic content
- Example:

  ```astro
  <button id="toggle">Toggle</button>

  <script>
    document.getElementById('toggle')?.addEventListener('click', () => {
      document.body.classList.toggle('dark');
    });
  </script>
  ```

### Imports

- Use `astro:content` for content collections
- Use `~/components/` alias for components (configured in tsconfig)
- Import styles in frontmatter or use `<style>` blocks

## Content Collections

### Schema Location

- **All schemas in `src/content.config.ts`** - Single source of truth
- Schemas use Zod for validation
- Invalid frontmatter fails the build (catches errors early)

### Blog Posts (`src/content/blog/*.mdx`)

```yaml
---
title: 'Post Title' # Required
description: 'Summary' # Required
pubDate: 2024-01-15 # Required (date)
tags: ['astro', 'web'] # Optional, default []
draft: true # Optional, default false (hides in production)
featured: false # Optional, default false
heroImage: '/images/hero.jpg' # Optional
updatedDate: 2024-01-20 # Optional
---
```

### Projects (`src/content/projects/*.md`)

```yaml
---
title: 'Project Name' # Required
description: 'What it does' # Required
tags: ['docker', 'python'] # Optional
link: 'https://example.com' # Optional, external URL
repo: 'https://github.com/...' # Optional, GitHub URL
year: 2024 # Optional
status: 'completed' # Optional: completed | in-progress | archived
featured: false # Optional
heroImage: '/images/proj.jpg' # Optional
---
```

### Querying Content

```typescript
import { getCollection } from 'astro:content';

// Get all non-draft blog posts
const posts = await getCollection('blog', ({ data }) => !data.draft);

// Sort by date
posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

// Get featured projects
const featured = await getCollection('projects', ({ data }) => data.featured);
```

## Styling System

### Tailwind CSS

- **Use utility classes** - Avoid custom CSS when possible
- **Custom tokens in `tailwind.config.js`** - Colors, fonts, spacing
- **Typography plugin** for prose content (`prose` class)

### CSS Variables (`src/styles/global.css`)

- Theme colors defined as CSS variables
- Light/dark mode via `.dark` class
- Example usage:
  ```css
  .card {
    background: var(--color-surface);
    color: var(--color-text);
  }
  ```

### Dark Mode

- **System preference detection** on initial load
- **Manual toggle** persisted to localStorage
- **FOUC prevention** - Inline script in `<head>` (see BaseHead.astro)

### Tag Color System

Tags are color-coded by category in `BlogCard.astro` and `ProjectCard.astro`:

| Category        | Color  | Keywords                                            |
| --------------- | ------ | --------------------------------------------------- |
| Data/ML         | Purple | data, ml, ai, python, pandas, pytorch, tensorflow   |
| DevOps/Homelab  | Green  | docker, kubernetes, devops, homelab, infrastructure |
| Web Development | Orange | web, frontend, backend, react, astro, javascript    |
| Default         | Blue   | Everything else                                     |

## Key Components

### Layouts

- **`BaseLayout.astro`** - Main wrapper (Header, Footer, skip links)
- **`BlogPost.astro`** - Blog-specific layout for posts

### Shared Components

- **`BaseHead.astro`** - SEO meta, OpenGraph, dark mode script
- **`Search.astro`** - Fuse.js fuzzy search with highlighting
- **`BlogCard.astro`** / **`ProjectCard.astro`** - Content cards
- **`FormattedDate.astro`** - Consistent date formatting

### Search Implementation

- Client-side Fuse.js with weighted keys
- Search data generated at build time (`src/utils/generate-search-data.js`)
- Weighted priorities: title (0.7) > description (0.3) > content (0.2) > tags (0.1)

## File Organization

### Pages (`src/pages/`)

- File-based routing: `about.astro` → `/about`
- Dynamic routes: `blog/[...slug].astro` → `/blog/post-name`
- API routes: `rss.xml.js` → `/rss.xml`

### Static Assets (`public/`)

- Images: `public/images/` → `/images/filename.jpg`
- Favicons: `public/` root
- No processing - served as-is

## DO / DON'T Summary

### DO

- Use Astro components for static content
- Validate content with Zod schemas
- Use Tailwind utilities over custom CSS
- Keep client-side JS minimal
- Use CSS variables for theming
- Test dark mode on all new components

### DON'T

- Add unnecessary client-side frameworks
- Skip schema validation (catches errors at build)
- Use inline styles (use Tailwind or CSS variables)
- Forget to handle dark mode in new components
- Commit draft posts as non-draft

## References

- Astro docs: https://docs.astro.build/
- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
- Tailwind CSS: https://tailwindcss.com/docs
- Fuse.js: https://fusejs.io/
