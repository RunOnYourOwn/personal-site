// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Aaron Brazier';
export const SITE_DESCRIPTION =
  'Senior Data Scientist specializing in machine learning, oil & gas analytics, and homelab infrastructure. Portfolio, blog, and project showcase.';

// Site version is now managed via VERSION file and git tags
// Use getSiteVersion() function to get current version

import { readFileSync } from 'fs';
import { join } from 'path';

export function getSiteVersion(): string {
  try {
    const versionPath = join(process.cwd(), 'VERSION');
    const version = readFileSync(versionPath, 'utf8').trim();
    return version;
  } catch {
    // Fallback if VERSION file doesn't exist
    return 'UNAVAILABLE';
  }
}
