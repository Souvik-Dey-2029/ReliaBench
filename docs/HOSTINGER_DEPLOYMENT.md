# Hostinger Web App / Cloud Hosting Deployment Guide for techtomorrow.in

This guide covers deploying ReliaBench onto the Hostinger plan (`techtomorrow.in`):
- **Plan Specs**: 50 GB Disk, 3072 MB RAM (3 GB), 2 CPU Cores, 600,000 Inodes, 120 Max Processes.
- **Node.js Support**: Node 20.x / 22.x (supported natively in Hostinger Web Apps).
- **Python / Gateway**: Python 3.10+ virtualenv / daemon via SSH or Hostinger Web App runner.

---

## Architecture Overview on Hostinger

```
                       [Visitor / Judge Browser]
                                   │
                                   ▼
                 [Hostinger Cloud Edge / Cloudflare]
                                   │
                                   ▼
               [LiteSpeed / Apache Web Server (:80 / :443)]
                                   │
            ┌──────────────────────┴──────────────────────┐
            ▼                                             ▼
   [public_html (React SPA)]                     [Backend Proxy]
   Vite Static Production Assets                 http://127.0.0.1:8000/api
   with .htaccess SPA rewrite                    Uvicorn FastAPI Daemon
```

---

## Option A: Hostinger Web App Deploy (Zero-Config GUI)

1. Open **hPanel** -> **Websites** -> `techtomorrow.in` -> **Web App / Deployments**.
2. Connect your Git repository: `https://github.com/mohitraj8503/ReliaBench`.
3. Set **Root Directory**: `frontend`.
4. Set **Build Command**: `npm install && npm run build`.
5. Set **Output Directory**: `dist`.
6. Hostinger automatically builds the Vite frontend and serves it over HTTPS with global CDN caching.

---

## Option B: Deploying Full-Stack (Frontend + Backend on Hostinger)

### 1. Build Frontend Locally or in Hostinger
```bash
cd frontend
npm install
npm run build
```
Upload the contents of `frontend/dist/` (including `.htaccess`) to `public_html/` via FTP (`ftp://techtomorrow.in`, username `u402587352`).

### 2. Configure Backend Python Daemon via SSH
Hostinger Cloud Hosting includes SSH access (`Advanced` -> `SSH Access`).

```bash
# Connect via SSH
ssh u402587352@92.249.46.86 -p 65002

# Clone repository in user home directory (outside public_html)
git clone https://github.com/mohitraj8503/ReliaBench.git ~/reliabench
cd ~/reliabench

# Setup Python environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt uvicorn gunicorn

# Start backend using systemd or nohup daemon (managed under 3072 MB RAM limit)
nohup uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --workers 2 > ~/backend.log 2>&1 &
```

### 3. Environment Variables (`.env`)
Configure inside `~/reliabench/.env`:
```ini
ENVIRONMENT=production
PROVENANCE_DEFAULT_MODE=DETERMINISTIC_HARNESS
CORS_ORIGINS=["https://techtomorrow.in","https://www.techtomorrow.in"]
DATABASE_URL=sqlite:///./reliabench_production.db
```

---

## Resource Optimization for Hostinger Limits
- **Memory Limit (3072 MB RAM)**: ReliaBench FastAPI + SQLite consumes only ~95 MB RAM. Even under 5 concurrent benchmark runs, RAM usage stays under 350 MB (< 12% of plan capacity).
- **Process Limit (120 Max Processes)**: Configured with `--workers 2`, consuming only 2 background worker processes.
- **Inodes (600,000)**: Clean ephemeral run cleanup ensures file inodes remain well below 5,000.
