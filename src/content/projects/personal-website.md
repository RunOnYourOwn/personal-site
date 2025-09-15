---
title: 'Personal Website'
description: 'Modern, blazing-fast personal website built with Astro, featuring custom OpenGraph images and comprehensive SEO optimization.'
link: 'https://aaronbrazier.com'
repo: 'https://github.com/runonyourown/personal-site'
year: 2025
tags:
  [
    'Astro',
    'TypeScript',
    'Tailwind CSS',
    'Docker',
    'Homelab',
    'CI/CD',
    'SEO',
    'OpenGraph',
  ]
featured: true
status: 'completed'
heroImage: '../../assets/og-image.png'
---

This is my personal website that showcases my work, projects, and thoughts. I built it to be fast, accessible, and easy to maintain while running on my own homelab infrastructure.

## Why I Built This

I wanted a website that could grow with me and my projects. Instead of using a template or CMS, I built something custom that gives me complete control over the design and functionality. Plus, it's a great way to experiment with new web technologies and deployment practices.

## What Makes It Special

### Performance First

- **Astro Framework** - Zero JavaScript by default means lightning-fast page loads
- **Optimized Images** - Custom OpenGraph images and responsive image handling
- **Minimal Bundle** - Only loads JavaScript when you actually need it
- **Perfect Lighthouse Scores** - 100/100 across all performance metrics

### Developer Experience

- **Type Safety** - Everything is typed with TypeScript and Zod validation
- **Content Collections** - Blog posts and projects are managed as structured data
- **Hot Reload** - Instant updates during development
- **Linting & Formatting** - Automated code quality checks

### User Experience

- **Mobile First** - Looks great on any device
- **Dark Mode** - Automatically matches your system preference
- **Accessibility** - Skip links, ARIA labels, and keyboard navigation
- **Search** - Find content quickly with fuzzy search

## Technical Stack

### Frontend

- **Astro** - The web framework that powers everything
- **Tailwind CSS** - Utility-first styling with custom design tokens
- **MDX** - Markdown with JSX for rich content
- **TypeScript** - Type safety throughout the codebase

### Content & SEO

- **Structured Data** - JSON-LD schemas for rich search results
- **OpenGraph** - Custom branded images for social sharing
- **Sitemap** - Automatic generation for search engines
- **Analytics** - Privacy-friendly Umami tracking

### Deployment & Infrastructure

- **Docker** - Containerized for consistent deployment
- **GitHub Actions** - Automated CI/CD pipeline
- **Portainer** - Container orchestration and management
- **SWAG** - Reverse proxy with automatic SSL certificates

## Development Workflow

When I want to add new content or make changes:

1. **Content Updates** - Just push to main, automated deployment handles the rest
2. **Code Changes** - Create a PR, CI checks run automatically, merge when ready
3. **Releases** - Tag a version, full deployment pipeline kicks in
4. **Monitoring** - Umami tracks usage and performance metrics

## Performance Results

This site loads in under a second and scores perfect Lighthouse ratings. The combination of Astro's zero-JS approach and optimized images means visitors get a fast, smooth experience regardless of their connection speed.

Building this website has been a great way to practice modern web development while creating something I actually use every day. It's also taught me a lot about deployment automation and infrastructure management.
