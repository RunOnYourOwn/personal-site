---
title: 'Personal Website'
description: 'Modern, blazing-fast personal website built with Astro, deployed via Docker to homelab with SWAG routing.'
link: 'https://aaronbrazier.com'
repo: 'https://github.com/runonyourown/personal-site'
year: 2025
tags: ['Astro', 'TypeScript', 'Tailwind CSS', 'Docker', 'Homelab', 'CI/CD']
featured: true
status: 'in-progress'
---

This is my personal website built with modern web technologies. It showcases my portfolio, blog posts, and projects while maintaining excellent performance and developer experience.

## Key Features

- **Blazing Fast**: Built with Astro for optimal performance
- **Dark Mode**: System preference detection with manual toggle
- **Content Collections**: Type-safe content management with Zod schemas
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **SEO Optimized**: Proper meta tags, sitemap, and RSS feeds
- **CI/CD Pipeline**: Automated deployment via GitHub Actions

## Tech Stack

- **Framework**: Astro + MDX
- **Styling**: Tailwind CSS with CSS variables
- **Content**: Astro Content Collections with Zod validation
- **Deployment**: Docker → GHCR → Portainer → SWAG
- **Fonts**: Inter (UI) + JetBrains Mono (code)

## Architecture

The site is deployed on my homelab infrastructure using:

- **Docker** for containerization
- **GitHub Container Registry** for image storage
- **Portainer** for container management
- **SWAG** for SSL termination and routing
- **GitHub Actions** for automated CI/CD
