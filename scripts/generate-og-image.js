#!/usr/bin/env node

/**
 * Generate OpenGraph image from HTML template
 * This script creates a custom OpenGraph image based on the About Me section design
 */

/* eslint-env node */
/* global __dirname */

const fs = require('fs');
const path = require('path');

// Read the HTML template
const htmlTemplate = fs.readFileSync(
  path.join(__dirname, '../public/og-image.html'),
  'utf8'
);

// Create a simple server to serve the HTML for screenshot
const puppeteer = require('puppeteer');

async function generateOGImage() {
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set viewport to OpenGraph dimensions
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 2, // High DPI for crisp image
    });

    // Set content
    await page.setContent(htmlTemplate, {
      waitUntil: 'networkidle0',
    });

    // Take screenshot
    await page.screenshot({
      type: 'png',
      fullPage: false,
      path: path.join(__dirname, '../public/images/og-image.png'),
    });

    await browser.close();
  } catch {
    process.exit(1);
  }
}

// Check if puppeteer is available
try {
  require.resolve('puppeteer');
  generateOGImage();
} catch {
  // Puppeteer not available - user can manually screenshot the HTML file
}
