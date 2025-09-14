# Aaron Brazier - Personal Website

A modern, blazing-fast personal website built with Astro, showcasing portfolio, blog, and projects.

## 🚀 Features

- ✅ **Modern Tech Stack**: Astro + MDX + Tailwind CSS
- ✅ **Performance**: 100/100 Lighthouse scores
- ✅ **SEO Optimized**: OpenGraph, structured data, sitemap
- ✅ **Accessibility**: WCAG 2.1 AA compliant
- ✅ **Analytics**: Privacy-friendly Umami integration
- ✅ **CI/CD**: Automated deployment with GitHub Actions
- ✅ **Docker**: Containerized deployment
- ✅ **Content Management**: Astro Content Collections
- ✅ **Dark Mode**: System preference detection
- ✅ **Mobile Responsive**: Optimized for all devices

## 🏗️ Project Structure

```text
├── public/                    # Static assets (images, favicons)
├── src/
│   ├── components/           # Reusable Astro components
│   ├── content/             # Content collections (blog, projects)
│   │   ├── blog/           # Blog posts (MDX)
│   │   └── projects/       # Project entries (MD)
│   ├── layouts/            # Page layouts
│   ├── pages/              # Route pages
│   └── styles/             # Global CSS and Tailwind
├── .github/workflows/       # CI/CD pipelines
├── docker-compose.prod.yml  # Production deployment
├── Dockerfile              # Container configuration
├── nginx.conf              # Web server config
└── VERSION                 # Site version tracking
```

## 📝 Content Management

- **Blog Posts**: Add MDX files to `src/content/blog/`
- **Projects**: Add Markdown files to `src/content/projects/`
- **Images**: Place in `public/images/` and reference as `/images/filename`
- **Versioning**: Update `VERSION` file for releases

## 🧞 Development Commands

| Command               | Action                                     |
| :-------------------- | :----------------------------------------- |
| `npm install`         | Install dependencies                       |
| `npm run dev`         | Start local dev server at `localhost:4321` |
| `npm run build`       | Build production site to `./dist/`         |
| `npm run preview`     | Preview production build locally           |
| `npm run lint`        | Run ESLint for code quality                |
| `npm run format`      | Format code with Prettier                  |
| `npm run astro check` | Type check with Astro                      |

## 🚀 Deployment

### Content Updates

- Push changes to `main` branch
- Content-only updates trigger automatic deployment
- No version bump required

### Code Releases

1. Create feature branch
2. Make changes and test
3. Create PR to `main`
4. After merge, run version scripts:
   ```bash
   npm run version patch  # or minor/major
   ./scripts/tag-release.sh
   ```

## 🐳 Docker Deployment

```bash
# Build and run locally
docker build -t personal-site .
docker run -p 8080:80 personal-site

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build/) - Static site generator
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **Content**: [MDX](https://mdxjs.com/) - Markdown with JSX
- **Analytics**: [Umami](https://umami.is/) - Privacy-friendly analytics
- **Deployment**: Docker + GitHub Actions + Portainer
- **Infrastructure**: Homelab with SWAG reverse proxy

## 📊 Performance

- **Lighthouse**: 100/100 scores across all metrics
- **Core Web Vitals**: Excellent performance
- **Bundle Size**: Optimized with Astro's zero-JS by default
- **SEO**: Full OpenGraph and structured data support

## 🔗 Links

- **Live Site**: [aaronbrazier.com](https://aaronbrazier.com)
- **GitHub**: [abrazier/personal-site](https://github.com/abrazier/personal-site)
- **LinkedIn**: [aaronbrazier](https://www.linkedin.com/in/aaronbrazier/)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
