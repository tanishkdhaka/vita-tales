# Production VPS Deployment & Operations Guide

This guide details how to deploy, operate, and maintain the **Next.js Biography & Success Stories Publishing Platform** on a standard self-hosted Linux VPS (Ubuntu 22.04 / 24.04 or Debian 12) without external dependencies, container overhead, or paid third-party CMS subscriptions.

---

## 1. Architecture Overview

```
[ Visitor / Admin Browser ]
            │ HTTPS (Port 443)
            ▼
   ┌──────────────────┐
   │      Nginx       │ (Reverse Proxy, SSL, Gzip, Rate Limiting, Static Asset Cache)
   └─────────┬────────┘
             │ HTTP (127.0.0.1:3000)
             ▼
   ┌──────────────────┐
   │ Next.js Standalone│ (Managed by systemd: biography.service)
   └────┬────────┬────┘
        │        │
        ▼        ▼
   ┌─────────┐ ┌───────────────┐
   │ SQLite  │ │ Local Uploads │
   │ (WAL)   │ │ (public/      │
   │ data/   │ │  uploads/)    │
   └─────────┘ └───────────────┘
```

- **Runtime**: Node.js 20.9.0+ (LTS recommended)
- **Application**: Standalone Next.js App Router (`output: 'standalone'`)
- **Database**: Embedded SQLite with WAL mode (`data/biography.db`)
- **Process Manager**: systemd (auto-restarts on failure and reboot)
- **Reverse Proxy**: Nginx (rate limits `/admin/login`, terminates SSL, disables proxy buffering for React Server Component streaming)

---

## 2. Server Prerequisites

On a fresh Ubuntu/Debian VPS:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20.x LTS & build essentials
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx sqlite3 git ufw

# 3. Configure firewall (UFW)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 3. Application Setup & Deployment

### Step A: Clone & Set Permissions
```bash
sudo mkdir -p /var/www/biography
sudo chown -R $USER:$USER /var/www/biography
git clone <repository_url> /var/www/biography
cd /var/www/biography
```

### Step B: Configure Environment Variables
Create the production environment file:
```bash
cp .env.example .env.production
nano .env.production
```

Configure the following:
```ini
ADMIN_USERNAME=admin
# Generate a strong password:
ADMIN_PASSWORD=your_super_strong_password_here

# Generate 32+ char secret: openssl rand -base64 32
SESSION_SECRET=your_32_char_random_secret_here

NEXT_PUBLIC_SITE_URL=https://yourdomain.com
SITE_NAME="Biography Stories"
NODE_ENV=production
PORT=3000
HOSTNAME=127.0.0.1
```

### Step C: Install Dependencies, Migrate & Build
```bash
# 1. Install production dependencies
npm ci

# 2. Initialize database schema & create admin user
npm run db:migrate

# 3. (Optional) Seed realistic sample biographies
npm run db:seed

# 4. Compile optimized standalone production build
npm run build

# 5. Copy static assets and uploads to standalone output
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

### Step D: Set Directory Permissions
Ensure the web server user (`www-data`) owns the persistent directories:
```bash
sudo chown -R www-data:www-data /var/www/biography/data
sudo chown -R www-data:www-data /var/www/biography/public/uploads
sudo chmod 775 /var/www/biography/data
sudo chmod 775 /var/www/biography/public/uploads
```

---

## 4. Systemd Service Configuration

Install the pre-configured systemd service file:
```bash
sudo cp deploy/biography.service /etc/systemd/system/biography.service
sudo systemctl daemon-reload
sudo systemctl enable biography.service
sudo systemctl start biography.service
```

### Useful systemd Commands:
- Check service status: `sudo systemctl status biography`
- View live application logs: `sudo journalctl -u biography -f`
- Restart application: `sudo systemctl restart biography`
- Stop application: `sudo systemctl stop biography`

---

## 5. Nginx & SSL Configuration

### Step A: Deploy Nginx Virtual Host
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/biography.conf
```
Edit `/etc/nginx/sites-available/biography.conf` to replace `yourdomain.com` with your real domain.

Enable the site configuration:
```bash
sudo ln -sf /etc/nginx/sites-available/biography.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Step B: Obtain Free Let's Encrypt SSL
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot will configure SSL certificates and schedule automatic renewals via systemd timers.

---

## 6. Backups & Disaster Recovery

### Automated Backups
The platform includes `scripts/backup.sh` which executes a non-blocking, online SQLite snapshot (`sqlite3 .backup`) along with all uploaded images into a compressed `.tar.gz` archive.

Test manual backup:
```bash
./scripts/backup.sh
```

### Schedule Daily Backups (Cron)
Add a cron job to run every night at 2:30 AM:
```bash
crontab -e
```
Add:
```cron
30 2 * * * /var/www/biography/scripts/backup.sh >> /var/log/biography_backup.log 2>&1
```

### Restoration Procedure
To restore from any backup archive:
```bash
sudo /var/www/biography/scripts/restore.sh /var/www/biography/backups/biography_backup_YYYYMMDD_HHMMSS.tar.gz
```

---

## 7. Updates & Redeployment Procedure

When pulling new code or updates:

```bash
cd /var/www/biography
git pull origin master
npm ci
npm run db:migrate
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
sudo systemctl restart biography
```

Data in `data/biography.db` and uploaded portraits in `public/uploads/` persist untouched throughout all code updates.

---

## 8. Operational Health Checks

- **Public Homepage**: `curl -I https://yourdomain.com`
- **Sitemap**: `curl -s https://yourdomain.com/sitemap.xml`
- **Robots.txt**: `curl -s https://yourdomain.com/robots.txt`
- **Admin Gate**: `curl -I https://yourdomain.com/admin` (returns 307 redirect to `/admin/login`)
- **Database Integrity**: `sqlite3 /var/www/biography/data/biography.db "PRAGMA integrity_check;"`
