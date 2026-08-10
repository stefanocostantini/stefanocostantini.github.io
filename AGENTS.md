# AGENTS.md

This file provides guidance to AI coding assistants (including Antigravity) when working with code in this repository.

## Repository Overview

This is a personal website hosted on GitHub Pages (stefanocostantini.github.io) showcasing sketches, writing (ebooks), and blog posts. It's a static site using vanilla HTML, CSS, and JavaScript with Jekyll configuration.

## Site Structure

### Main Pages
- **index.html** - Homepage displaying sketch galleries (watercolours, digital, people), blog post links, music compositions, and ebook downloads
- **gallery.html** - Standalone gallery page (less actively used)
- **lambeth.html** - Utility page for Lambeth waste collection API interactions (not part of main site content)
- **food/index.html** - PWA-enabled food hygiene ratings search tool for UK establishments

### Content Organization
- **sketches/** - Organized by category (watercolours/, digital/, people/, black_and_white/)
  - Each category contains images and a `*_imagelist.txt` file listing image filenames
  - The `.txt` files drive the dynamic gallery loading in gallery.js
- **album_covers/** - Cover images for musical compositions (linked from index.html)
- **album_scores/** - PDF sheet music / scores for musical compositions (downloadable from index.html)
- **blog_posts/** - HTML files for blog content
- **book_covers/** - Cover images for ebooks
- **ebooks/** - EPUB files for download
- **blog_images/** - Supporting images for blog posts

## Gallery System Architecture

The site uses a custom dynamic gallery system implemented in **gallery.js**:

### How It Works
1. Gallery categories are defined by text files (e.g., `watercolours_imagelist.txt`) containing newline-separated image filenames
2. `loadGalleryImages()` fetches these lists, constructs image paths, and dynamically creates gallery items
3. Each gallery supports:
   - Lazy loading with loading states
   - Lightbox view with navigation (keyboard arrows, click/tap, swipe)
   - URL hash-based deep linking to specific images
   - Touch gestures for mobile (swipe to navigate, double-tap to close)
4. Multiple galleries can coexist on the same page (index.html has watercolours, digital, and people galleries)

### Adding Images to Galleries
To add new images to a gallery:
1. Place the image file in the appropriate `sketches/[category]/` directory
2. Add the filename to the corresponding `[category]_imagelist.txt` file
3. The gallery will automatically load and display the new image

## Styling System

**styles.css** uses:
- CSS custom properties (variables) for consistent theming
- `clamp()` for responsive typography and spacing
- Mobile-first responsive design with media queries
- Modern CSS features (Grid, backdrop-filter, CSS transitions)
- Dark mode support via `prefers-color-scheme`

Key design elements:
- Dark background (#222222) with light text (#dddddd)
- Futura/Jost font stack for consistent typography
- Responsive gallery grid using `repeat(auto-fit, minmax(120px, 1fr))`

## Special Features

### Food Hygiene PWA (food/index.html)
- Single-file PWA with inline service worker
- Uses UK Food Standards Agency API (api.ratings.food.gov.uk)
- Includes exponential backoff retry logic for rate limiting
- Embeds Google Maps for location display
- Service worker registration via Blob URL

### Email Obfuscation
The homepage uses JavaScript-based email obfuscation to prevent scraping (see index.html:36-41)

## Jekyll Configuration

Despite being a mostly static site, there's a `_config.yml` for potential Jekyll features:
- Sitemap plugin enabled
- Data directory support configured

## No Build Process

This site has no build tooling or package.json. All changes are direct HTML/CSS/JS edits. To preview changes, simply open HTML files in a browser or use a local web server like `python -m http.server`.

## Git Workflow

- Main branch: **master**
- Direct commits or PRs to master for deployments
- GitHub Pages automatically deploys from master branch
