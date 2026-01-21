---
title: 'Personal Website'
description: 'This site—built with Astro and deployed on my homelab.'
repo: 'https://github.com/runonyourown/personal-site'
year: 2025
tags: ['Astro', 'TypeScript', 'Docker', 'CI/CD']
featured: true
status: 'completed'
---

I built this site because I wanted something simple that I could actually maintain. No CMS, no complicated framework—just markdown files and a static site generator.

## How It Works

The site is built with Astro, which outputs plain HTML with zero JavaScript by default. Blog posts and projects are markdown files with frontmatter that gets validated at build time. Tailwind handles the styling.

For deployment, I push to GitHub and a webhook triggers Portainer to pull the new Docker image. The whole process takes about a minute from commit to live.

## What I Learned

Building this taught me more about web fundamentals than I expected. Astro's approach of shipping no JavaScript unless you explicitly need it made me think harder about what actually requires client-side code. Turns out, not much.

The deployment pipeline was also a good exercise in automation. Getting GitHub Actions, Docker, and Portainer to work together took some iteration, but now I don't have to think about deployments at all.

The source code is on [GitHub](https://github.com/runonyourown/personal-site) if you're curious.
