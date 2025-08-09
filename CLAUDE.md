# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern portfolio homepage for Martin von Wysiecki, built as a static site with interactive JavaScript features and deployed via Docker/nginx.

## Essential Commands

### Docker Operations (Primary Method)
```bash
# Build and run the container
docker compose build
docker compose up -d

# Access at: http://localhost:8080

# View logs
docker compose logs -f homepage

# Stop/restart
docker compose down
docker compose restart

# Clean rebuild
docker compose down --rmi all
docker compose build --no-cache
```

### Development Workflow

#### With Docker Hot Reload
1. Uncomment volumes section in `docker-compose.yml` (lines 14-18)
2. Run: `docker compose --profile dev up`
3. Access nginx server at port 8080, Tailwind watcher at port 3000

#### Local Development
```bash
# Install dependencies
npm install

# Build CSS (production)
npm run build

# Watch CSS changes (development)
npm run dev

# Serve locally
python3 -m http.server 8000
```

## Architecture

### Technology Stack
- **Frontend**: Vanilla JavaScript with Tailwind CSS
- **Styling**: Tailwind CSS with custom animations and glassmorphism effects
- **Deployment**: Multi-stage Docker build with nginx
- **Build Process**: Node.js for Tailwind CSS compilation

### Key Components

1. **index.html**: Single-page application with sections for hero, about, skills, projects, and contact
2. **script.js**: All interactive features including:
   - Particle animation canvas
   - Dark/light mode toggle with localStorage persistence
   - Interactive terminal in skills section (commands: help, skills, projects, contact, clear)
   - 3D flip cards for projects
   - Typewriter effect
   - Smooth scroll navigation with active link highlighting
   - Project filtering system

3. **Tailwind Configuration**: 
   - Custom animations (float, glow, typewriter, gradient)
   - Dark mode support via class strategy
   - Extended color palette for primary colors
   - Custom keyframes for various animations

4. **Docker Setup**:
   - Multi-stage build: Node.js builder stage for Tailwind, nginx production stage
   - nginx configured with gzip compression, security headers, and caching
   - Health check endpoint at `/health`

### File Generation Flow
```
src/input.css → [Tailwind Build] → dist/output.css → [Docker Copy] → nginx serve
```

## Important Configuration Notes

- Port 8080 is exposed by default (configurable in docker-compose.yml)
- The `version` attribute in docker-compose.yml triggers a warning but is harmless
- CSS is minified in production build
- Static assets are cached for 30 days, HTML for 1 hour
- Content Security Policy is configured in nginx.conf

## Interactive Features to Test

1. Dark mode toggle (persists in localStorage)
2. Terminal commands in skills section
3. Project card flipping (click to flip)
4. Project filtering buttons
5. Smooth scroll navigation
6. Animated skill bars on scroll
7. Particle background with connection lines