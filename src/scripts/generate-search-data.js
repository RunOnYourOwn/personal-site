// Script to generate search data for Fuse.js
import { getCollection } from 'astro:content';

export async function generateSearchData() {
  try {
    // Get all blog posts
    const blogPosts = await getCollection('blog');
    const blogSearchData = blogPosts
      .filter(post => !post.data.draft)
      .map(post => ({
        id: post.id,
        title: post.data.title,
        description: post.data.description,
        content: post.body, // Raw markdown content
        tags: post.data.tags || [],
        type: 'blog',
        slug: post.slug,
        extension: post.id.split('.').pop(), // Get file extension (.md or .mdx)
        date: post.data.date?.toISOString(),
        featured: post.data.featured || false,
      }));

    // Get all projects
    const projects = await getCollection('projects');
    const projectSearchData = projects.map(project => ({
      id: project.id,
      title: project.data.title,
      description: project.data.description,
      content: project.body, // Raw markdown content
      tags: project.data.tags || [],
      type: 'project',
      slug: project.slug,
      year: project.data.year,
      featured: project.data.featured || false,
      status: project.data.status || 'completed',
    }));

    // Combine all search data
    const allSearchData = [...blogSearchData, ...projectSearchData];

    return {
      blog: blogSearchData,
      projects: projectSearchData,
      all: allSearchData,
    };
  } catch {
    // Return empty data on error
    return {
      blog: [],
      projects: [],
      all: [],
    };
  }
}
