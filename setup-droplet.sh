#!/bin/bash
set -e

echo "🚀 Tool Parts Finder - Automated Droplet Setup"
echo "=============================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root (use: sudo bash setup-droplet.sh)"
  exit 1
fi

echo ""
echo "📦 Step 1: Installing dependencies..."
apt update -qq
apt upgrade -y -qq
apt install -y python3.11 python3.11-venv python3-pip nginx git curl

echo ""
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
apt install -y nodejs

echo ""
echo "📥 Step 2: Cloning repository..."
cd /var/www
if [ -d "tool-parts-finder" ]; then
  echo "Repository exists, pulling latest..."
  cd tool-parts-finder
  git pull origin main
else
  git clone https://github.com/MintShards/tool-parts-finder.git
  cd tool-parts-finder
fi

echo ""
echo "🐍 Step 3: Setting up backend..."
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -q -r requirements.txt

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
Environment="HOST=0.0.0.0"
Environment="PORT=8000"
Environment="CORS_ORIGINS=*"
ExecStart=/var/www/tool-parts-finder/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Fix permissions
chown -R www-data:www-data /var/www/tool-parts-finder

# Start backend
systemctl daemon-reload
systemctl enable tool-parts-backend
systemctl restart tool-parts-backend

echo ""
echo "⚛️  Step 4: Building frontend..."
cd /var/www/tool-parts-finder/frontend

# Create production env
cat > .env.production << 'EOF'
VITE_API_URL=/api
EOF

# Build
npm install --silent
npm run build

# Deploy to nginx
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/

echo ""
echo "🌐 Step 5: Configuring Nginx..."
cat > /etc/nginx/sites-available/tool-parts-finder << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    # Frontend
    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

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
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:8000/;
        access_log off;
    }
}
EOF

# Enable site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/tool-parts-finder /etc/nginx/sites-enabled/

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx

echo ""
echo "✅ Deployment Complete!"
echo "=============================================="
echo ""
echo "🌐 Your app is now running at:"
echo "   http://$(curl -s ifconfig.me)"
echo ""
echo "📊 Check status:"
echo "   Backend: systemctl status tool-parts-backend"
echo "   Nginx:   systemctl status nginx"
echo ""
echo "📝 View logs:"
echo "   Backend: journalctl -u tool-parts-backend -f"
echo "   Nginx:   tail -f /var/log/nginx/error.log"
echo ""
echo "🔄 To update later:"
echo "   cd /var/www/tool-parts-finder && git pull"
echo "   systemctl restart tool-parts-backend"
echo "   cd frontend && npm run build && cp -r dist/* /var/www/html/"
echo ""
