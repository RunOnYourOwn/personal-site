---
title: "Example Project"
description: "A sample project to demonstrate the projects collection functionality."
year: 2023
tags: ["Example", "Demo", "Template"]
featured: false
status: "completed"
---

This is an example project entry to demonstrate how the projects collection works. You can use this as a template for adding your own projects.

## Features

- **Type Safety**: All project metadata is validated with Zod schemas
- **Flexible Schema**: Support for various project types and statuses
- **Rich Metadata**: Links, repositories, tags, and more
- **Featured Projects**: Highlight important projects
- **Status Tracking**: Track project completion status

## Usage

To add a new project, simply create a new `.md` file in the `src/content/projects/` directory with the required frontmatter fields.

## Schema Fields

- `title`: Project name
- `description`: Brief project description
- `link`: Live project URL (optional)
- `repo`: Repository URL (optional)
- `year`: Project completion year (optional)
- `tags`: Array of technology tags
- `featured`: Boolean to highlight important projects
- `status`: Project status (completed, in-progress, archived)
