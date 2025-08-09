# Martin von Wysiecki - Portfolio Homepage

Modern, interactive portfolio homepage with Docker support.

## 🚀 Quick Start with Docker

### Using Docker Compose (Recommended)

1. **Build and start the container:**
   ```bash
   docker-compose up -d
   ```

2. **Access the homepage:**
   Open your browser and navigate to: `http://localhost:8080`

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Docker Commands

**Build the image:**
```bash
docker-compose build
```

**Start in detached mode:**
```bash
docker-compose up -d
```

**View logs:**
```bash
docker-compose logs -f homepage
```

**Restart the container:**
```bash
docker-compose restart
```

**Remove containers and networks:**
```bash
docker-compose down
```

**Remove everything including images:**
```bash
docker-compose down --rmi all
```

## 🛠️ Development Mode

### With Docker (Hot Reload)

1. **Uncomment the volume mounts in `docker-compose.yml`:**
   ```yaml
   volumes:
     - ./index.html:/usr/share/nginx/html/index.html:ro
     - ./script.js:/usr/share/nginx/html/script.js:ro
     - ./dist:/usr/share/nginx/html/dist:ro
   ```

2. **Run the development container:**
   ```bash
   docker-compose --profile dev up
   ```

This will start both the nginx server (port 8080) and the Tailwind watcher (port 3000).

### Without Docker

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Tailwind CSS watcher:**
   ```bash
   npm run dev
   ```

3. **Open `index.html` in your browser or use a local server:**
   ```bash
   python3 -m http.server 8000
   # or
   npx serve .
   ```

## 📁 Project Structure

```
homepage/
├── index.html          # Main HTML file
├── script.js           # JavaScript interactions
├── src/
│   └── input.css      # Tailwind input CSS
├── dist/
│   └── output.css     # Compiled CSS (generated)
├── tailwind.config.js  # Tailwind configuration
├── package.json        # Node dependencies
├── Dockerfile          # Docker image definition
├── docker-compose.yml  # Docker Compose configuration
├── nginx.conf          # Nginx server configuration
└── .dockerignore       # Docker ignore file
```

## 🎨 Features

- Animated particle background
- Dark/light mode toggle
- Interactive terminal
- 3D flip project cards
- Smooth scroll animations
- Responsive design
- Glassmorphism effects
- Typewriter effect
- Timeline animations
- Project filtering

## 🔧 Configuration

### Change Port

Edit `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:80"
```

### Environment Variables

The Docker setup supports these environment variables:
- `NGINX_HOST`: Server hostname (default: localhost)
- `NGINX_PORT`: Internal nginx port (default: 80)

## 📊 Health Check

The container includes a health check endpoint:
```bash
curl http://localhost:8080/health
```

## 🚢 Production Deployment

For production deployment:

1. Build the optimized image:
   ```bash
   docker-compose build --no-cache
   ```

2. Run with restart policy:
   ```bash
   docker-compose up -d
   ```

The container will automatically restart unless explicitly stopped.

## 📝 License

© 2024 Martin von Wysiecki. All rights reserved.