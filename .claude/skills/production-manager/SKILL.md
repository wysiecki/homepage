---
name: production-manager
description: "Manage production deployments for wysiecki.de. Use this skill whenever the user wants to deploy, check status, view logs, rollback, or manage environment variables on the production server. Trigger on phrases like: 'deploy to production', 'push to prod', 'check production', 'production status', 'server logs', 'rollback', 'update env', 'SMTP credentials', 'is the site up', 'deploy this', or any mention of wysiecki.de in an operational context."
---

# Production Manager — wysiecki.de

Manage the production deployment of Martin von Wysiecki's portfolio homepage.

## Infrastructure

| Component | Details |
|-----------|---------|
| **Production server** | SSH host `dockerhost` |
| **Project path (server)** | `/home/wysiecki/projects/homepage` |
| **Project path (local)** | `/Users/wysiecki/projects/wysiecki/homepage` |
| **Repository** | `https://github.com/wysiecki/homepage` (public) |
| **Domain** | `wysiecki.de` / `www.wysiecki.de` |
| **Reverse proxy** | Traefik (SSL via cloudflare certresolver) |
| **Docker network** | `mvw-net` (external, shared with traefik) |
| **Env file** | `/home/wysiecki/projects/homepage/.env` on server |

### Docker Services

| Container | Image | Role | Port |
|-----------|-------|------|------|
| `wysiecki-homepage` | `whyzzie/homepage-next` | Next.js standalone app | 3000 (internal) |

### Health Endpoints

- **API**: `https://wysiecki.de/api/health` — should return `{"status":"ok","smtp":...}`

## Actions

When the user asks for a production action, identify which one they need and follow the corresponding procedure. Always confirm destructive actions (rollback, env changes) before executing.

### 1. Deploy

Deploy local changes to production. This is the most common action — trigger it when the user says things like "deploy", "push to prod", "ship it", or "update production".

The deployment flow is: push to main → GitHub Actions builds amd64 image and pushes to Docker Hub → deploy from local machine via SSH.

**Note:** GitHub Actions only builds and pushes images. Deployment (pulling images on the server) is triggered locally via SSH because the production server's firewall does not allow inbound SSH from GitHub Actions runners.

```bash
# Step 1: Ensure local changes are committed and pushed
cd /Users/wysiecki/projects/wysiecki/homepage
git status  # Show user any uncommitted changes first
git push origin main

# Step 2: Wait for GitHub Actions to build and push images
gh run list --limit 1  # Check latest run status
gh run watch           # Watch it complete (or poll with gh run view)

# Step 3: Deploy from local machine via SSH (pulls images, restarts, health checks)
ssh dockerhost "/home/wysiecki/projects/homepage/deploy.sh"
```

If health checks fail, immediately show logs and alert the user. Do NOT proceed silently.

For urgent deploys that can't wait for CI, use the manual build script first:
```bash
./scripts/build-push.sh && ssh dockerhost "/home/wysiecki/projects/homepage/deploy.sh"
```

### 2. Status

Check if production is healthy. Use this when the user asks "is the site up", "production status", "check prod", etc.

```bash
# Container status
ssh dockerhost "docker ps --filter name=wysiecki --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

# Health endpoints
curl -s https://wysiecki.de/health
curl -s https://wysiecki.de/api/health

# Current commit on server
ssh dockerhost "cd /home/wysiecki/projects/homepage && git log --oneline -3"
```

Report results in a concise summary. Flag anything unhealthy.

### 3. Logs

Show recent container logs. Default to last 50 lines unless the user asks for more.

```bash
# Homepage (Next.js) logs
ssh dockerhost "docker logs wysiecki-homepage --tail 50"
```

If the user mentions "errors", add `2>&1 | grep -i error` to filter.

### 4. Rollback

Revert to a previous commit on the server. This is destructive — always confirm with the user before executing.

```bash
# Step 1: Show recent commits so user can pick one
ssh dockerhost "cd /home/wysiecki/projects/homepage && git log --oneline -10"

# Step 2: After user confirms the target commit:
ssh dockerhost "cd /home/wysiecki/projects/homepage && git checkout <commit-hash> && docker compose pull && docker compose up -d"

# Step 3: Verify
sleep 5
curl -s https://wysiecki.de/health
curl -s https://wysiecki.de/api/health
```

After a successful rollback, remind the user that the server is in detached HEAD state. To make it permanent, they'll need to revert on main and push.

### 5. Env

Manage the `.env` file on the server. Used for SMTP credentials and other configuration.

```bash
# Show current env (mask passwords)
ssh dockerhost "cat /home/wysiecki/projects/homepage/.env" | sed 's/\(SMTP_PASS=\).*/\1****/'

# Update a variable (confirm with user first!)
ssh dockerhost "sed -i 's|^SMTP_HOST=.*|SMTP_HOST=smtp.example.com|' /home/wysiecki/projects/homepage/.env"

# After env changes, restart the container to pick up new values
ssh dockerhost "cd /home/wysiecki/projects/homepage && docker compose up -d"
```

The `.env` variables are:
- `SMTP_HOST` — SMTP server hostname
- `SMTP_PORT` — SMTP port (default: 587)
- `SMTP_USER` — SMTP username/email
- `SMTP_PASS` — SMTP password (sensitive!)
- `MAIL_TO` — Recipient email (default: info@wysiecki.de)
- `MAIL_FROM` — Sender email address

After any env change, always restart the `api` container and verify with the health endpoint.

## Important Rules

- **Never push to GitHub without the user explicitly directing you to.** This is a hard rule from the user's global config.
- **Always verify health after deploy or rollback.** If health checks fail, show logs immediately.
- **Mask sensitive values** when displaying env contents (SMTP_PASS).
- **Confirm before destructive actions**: rollback, env changes, container restarts.
- **SSH command pattern**: Always use `ssh dockerhost "<command>"` — the host alias is already configured.
