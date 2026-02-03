# Deployment Guide

Complete guide for deploying Tool Parts Finder to production using DigitalOcean, Hostinger, and MongoDB Atlas.

## Architecture Overview

```
[Users] → [Hostinger (Frontend)] → [DigitalOcean (Backend API)] → [MongoDB Atlas]
```

- **Frontend**: Static React build hosted on Hostinger
- **Backend**: FastAPI running on DigitalOcean Droplet
- **Database**: MongoDB Atlas (managed cloud database)

## Prerequisites

- DigitalOcean account
- Hostinger account (with hosting plan)
- MongoDB Atlas account (already configured)
- Domain name (optional but recommended)

---

## Part 1: MongoDB Atlas (Database)

### Already Configured ✅

Your MongoDB Atlas should already be set up from development. Ensure:

1. **IP Whitelist**: Add DigitalOcean droplet IP once created
2. **Connection String**: Keep your URI handy for backend configuration
3. **Database**: `tool_parts_finder` should exist

---

## Part 2: DigitalOcean (Backend API)

### Step 1: Create Droplet

1. Go to DigitalOcean dashboard
2. Click **Create** → **Droplets**
3. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($6/month - 1GB RAM is sufficient for MVP)
   - **Datacenter**: Choose closest to your location
   - **Authentication**: SSH key (recommended) or password
4. Create droplet and note the IP address

### Step 2: Initial Server Setup

SSH into your droplet:
```bash
ssh root@YOUR_DROPLET_IP
```

Update system:
```bash
apt update && apt upgrade -y
```

Install Python 3.11:
```bash
apt install -y python3.11 python3.11-venv python3-pip git nginx
```

### Step 3: Deploy Backend

Clone repository:
```bash
cd /opt
git clone https://github.com/yourusername/tool-parts-finder.git
cd tool-parts-finder/backend
```

Create virtual environment:
```bash
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Install Playwright (for Phase 4):
```bash
playwright install chromium
playwright install-deps chromium
```

Create production `.env`:
```bash
nano /opt/tool-parts-finder/backend/.env
```

Add:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tool_parts_finder?retryWrites=true&w=majority
DATABASE_NAME=tool_parts_finder
OPENAI_API_KEY=sk-your-key-here
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Step 4: Configure Systemd Service

Create service file:
```bash
nano /etc/systemd/system/tool-parts-finder.service
```

Add:
```ini
[Unit]
Description=Tool Parts Finder API
After=network.target

[Service]
Type=notify
User=root
WorkingDirectory=/opt/tool-parts-finder/backend
Environment="PATH=/opt/tool-parts-finder/backend/venv/bin"
ExecStart=/opt/tool-parts-finder/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

Install Gunicorn:
```bash
source /opt/tool-parts-finder/backend/venv/bin/activate
pip install gunicorn
```

Enable and start service:
```bash
systemctl daemon-reload
systemctl enable tool-parts-finder
systemctl start tool-parts-finder
systemctl status tool-parts-finder
```

### Step 5: Configure Nginx Reverse Proxy

Create Nginx config:
```bash
nano /etc/nginx/sites-available/tool-parts-finder
```

Add:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Use subdomain for API

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/tool-parts-finder /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 6: SSL Certificate (Optional but Recommended)

Install Certbot:
```bash
apt install -y certbot python3-certbot-nginx
```

Get SSL certificate:
```bash
certbot --nginx -d api.yourdomain.com
```

### Step 7: Firewall Configuration

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### Step 8: Test Backend

```bash
curl http://YOUR_DROPLET_IP:8000/health
# Should return: {"status":"healthy","database":"connected","api_version":"1.0.0"}
```

---

## Part 3: Hostinger (Frontend)

### Step 1: Build Frontend

On your local machine:
```bash
cd frontend

# Update API URL for production
echo "VITE_API_URL=https://api.yourdomain.com" > .env.production

# Build
npm run build
```

This creates a `dist/` folder with static files.

### Step 2: Upload to Hostinger

#### Option A: File Manager (Simple)

1. Log in to Hostinger control panel
2. Go to **File Manager**
3. Navigate to `public_html` (or your domain's root)
4. Upload all files from `frontend/dist/`
5. Ensure `index.html` is in the root

#### Option B: FTP (Recommended)

Use FileZilla or similar:
```
Host: ftp.yourdomain.com
Username: your-hostinger-username
Password: your-hostinger-password
Port: 21
```

Upload `frontend/dist/*` to `public_html/`

#### Option C: Git Deploy (Advanced)

If Hostinger supports Git deployment:
```bash
# In frontend/ directory
git add dist/
git commit -m "Production build"
git push origin main
```

### Step 3: Configure Domain

1. In Hostinger panel, go to **Domains**
2. Point your domain to Hostinger servers (DNS management)
3. Wait for DNS propagation (up to 24 hours, usually <1 hour)

### Step 4: Configure .htaccess (for React Router)

Create `public_html/.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Step 5: Test Frontend

Visit `https://yourdomain.com` - you should see the Tool Parts Finder!

---

## Part 4: MongoDB Atlas Whitelist Update

1. Go to MongoDB Atlas
2. Click **Network Access**
3. Add IP address: `YOUR_DROPLET_IP/32`
4. Save

Test connection from droplet:
```bash
mongosh "your-mongodb-atlas-uri"
```

---

## Post-Deployment

### Health Check Endpoints

- **Frontend**: `https://yourdomain.com`
- **Backend API**: `https://api.yourdomain.com/health`
- **Database**: Check MongoDB Atlas dashboard

### Monitor Backend Logs

```bash
# On DigitalOcean droplet
journalctl -u tool-parts-finder -f
```

### Restart Services

```bash
# Backend
systemctl restart tool-parts-finder

# Nginx
systemctl restart nginx
```

### Update Application

#### Backend
```bash
cd /opt/tool-parts-finder
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
systemctl restart tool-parts-finder
```

#### Frontend
```bash
# On local machine
cd frontend
npm run build

# Upload new dist/ to Hostinger
```

---

## Backup Strategy

### Database (MongoDB Atlas)
- Automatic backups enabled by default on Atlas
- Download backup: Atlas UI → Clusters → Backup

### Backend Code
- Stored in Git repository
- Consider automated backups with DigitalOcean Snapshots

### Environment Variables
```bash
# On droplet, backup .env
cp /opt/tool-parts-finder/backend/.env /root/backups/env-backup-$(date +%Y%m%d).txt
```

---

## Scaling Considerations

### Current Setup (2-6 users)
- DigitalOcean: $6/month (1GB RAM) ✅
- MongoDB Atlas: Free tier (512MB) ✅
- Hostinger: Existing plan ✅

### Future Scaling (10+ users)
- Upgrade DigitalOcean to $12/month (2GB RAM)
- MongoDB Atlas: Upgrade to M2 ($9/month)
- Consider CDN for frontend (Cloudflare free tier)

---

## Troubleshooting

### Backend not responding
```bash
systemctl status tool-parts-finder
journalctl -u tool-parts-finder -n 50
```

### Database connection issues
- Check MongoDB Atlas IP whitelist
- Test connection: `mongosh "connection-string"`

### CORS errors
- Update `CORS_ORIGINS` in backend `.env`
- Restart backend: `systemctl restart tool-parts-finder`

### Frontend not loading
- Check browser console for errors
- Verify API URL in frontend build
- Check Hostinger file permissions

---

## Security Checklist

- [x] SSL certificates installed (Certbot)
- [x] Firewall configured (UFW)
- [x] MongoDB IP whitelist restricted
- [x] Environment variables secured
- [x] Regular system updates scheduled
- [ ] Consider fail2ban for SSH protection
- [ ] Monitor logs regularly

---

## Cost Summary

| Service | Plan | Cost/Month |
|---------|------|------------|
| DigitalOcean Droplet | Basic (1GB) | $6 |
| MongoDB Atlas | M0 Free Tier | $0 |
| Hostinger | Existing Plan | $0* |
| **Total** | | **$6/month** |

*Assuming you already have Hostinger hosting

---

## Support

For deployment issues:
1. Check logs on DigitalOcean droplet
2. Verify MongoDB Atlas connection
3. Test API endpoints manually
4. Review this guide step-by-step

**Production deployment complete! 🚀**
