# Deploy to Existing DigitalOcean Droplet

Guide for deploying to your existing droplet: **146.190.126.223**

## 🎯 Quick Deploy Script

SSH into your droplet and run this automated setup:

```bash
ssh root@146.190.126.223

# Run automated setup
curl -sSL https://raw.githubusercontent.com/MintShards/tool-parts-finder/main/setup-droplet.sh | bash
```

Or manual setup below ↓

---

## 📋 Manual Setup Instructions

### Step 1: SSH into Droplet
```bash
ssh root@146.190.126.223
```

### Step 2: Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Python 3.11+
apt install python3.11 python3.11-venv python3-pip -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install nodejs -y

# Install nginx
apt install nginx -y

# Install certbot for SSL
apt install certbot python3-certbot-nginx -y
```

### Step 3: Clone Repository
```bash
cd /var/www
git clone https://github.com/MintShards/tool-parts-finder.git
cd tool-parts-finder
```

### Step 4: Setup Backend
```bash
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create systemd service
cat > /etc/systemd/system/tool-parts-backend.service << 'EOF'
[Unit]
Description=Tool Parts Finder Backend
After=network.target

[Service]
Type=exec
User=www-data
WorkingDirectory=/var/www/tool-parts-finder/backend
Environment="PATH=/var/www/tool-parts-finder/backend/venv/bin"
ExecStart=/var/www/tool-parts-finder/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Start backend service
systemctl daemon-reload
systemctl enable tool-parts-backend
systemctl start tool-parts-backend

# Check status
systemctl status tool-parts-backend
```

### Step 5: Setup Frontend
```bash
cd /var/www/tool-parts-finder/frontend

# Create production .env
cat > .env.production << 'EOF'
VITE_API_URL=https://YOUR_DOMAIN/api
EOF

# Install and build
npm install
npm run build

# Copy build to nginx
cp -r dist/* /var/www/html/
```

### Step 6: Configure Nginx
```bash
cat > /etc/nginx/sites-available/tool-parts-finder << 'EOF'
server {
    listen 80;
    server_name 146.190.126.223;  # Replace with your domain if you have one

    # Frontend
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/tool-parts-finder /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Remove default site

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx
```

### Step 7: Setup SSL (Optional but Recommended)

**If you have a domain pointed to 146.190.126.223:**
```bash
certbot --nginx -d yourdomain.com

# Auto-renewal
systemctl enable certbot.timer
```

**Without domain (Self-Signed Certificate):**
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt
```

---

## ✅ Verify Deployment

### Check Backend
```bash
curl http://localhost:8000/
# Should return: {"status": "healthy"}
```

### Check Services
```bash
systemctl status tool-parts-backend
systemctl status nginx
```

### Access Your App
Open browser: `http://146.190.126.223`

---

## 🔄 Update Deployment

When you push code changes:

```bash
ssh root@146.190.126.223

cd /var/www/tool-parts-finder

# Pull latest code
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
systemctl restart tool-parts-backend

# Update frontend
cd ../frontend
npm install
npm run build
cp -r dist/* /var/www/html/

# Done!
```

---

## 🐛 Troubleshooting

### Backend not starting
```bash
# Check logs
journalctl -u tool-parts-backend -f

# Check if port 8000 is in use
netstat -tulpn | grep 8000
```

### Nginx errors
```bash
# Check error logs
tail -f /var/log/nginx/error.log

# Test config
nginx -t
```

### Frontend not loading
```bash
# Check if files exist
ls -la /var/www/html/

# Check nginx access logs
tail -f /var/log/nginx/access.log
```

---

## 🔒 Security Hardening

### Setup Firewall
```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### Create Non-Root User
```bash
adduser deploy
usermod -aG sudo deploy

# Use this user instead of root
```

### Disable Root SSH
```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Change: PermitRootLogin no
systemctl restart sshd
```

---

## 📊 Monitoring

### View Backend Logs
```bash
journalctl -u tool-parts-backend -f
```

### View Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Check Resource Usage
```bash
htop  # Install: apt install htop
```

---

## 💰 Cost

**Current Droplet**: $6/month (512MB RAM)
- Sufficient for moderate traffic (100-500 users/day)
- Can upgrade to 1GB ($12/month) if needed

---

## ⚠️ Note on 512MB RAM

Your droplet has minimal RAM. Monitor memory usage:
```bash
free -h
```

If experiencing issues, consider upgrading to 1GB droplet.
