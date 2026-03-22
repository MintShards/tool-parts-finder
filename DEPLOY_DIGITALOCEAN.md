# DigitalOcean Deployment Guide

Complete guide for deploying Tool Parts Finder to DigitalOcean App Platform.

## 🏗️ Architecture Overview

```
[Users] → [DigitalOcean App Platform]
          ├─ Frontend (Static Site) - React build
          └─ Backend (Service) - FastAPI API

[localStorage] - All data stored in browser (no database needed!)
```

**Cost**: ~$5-12/month total
- Backend API: $5/month (basic-xxs instance)
- Frontend: $0-3/month (can use free tier or external host)
- Database: $0 (localStorage only!)

---

## 🚀 Quick Deploy (Recommended)

### Prerequisites
- DigitalOcean account ([sign up](https://www.digitalocean.com))
- GitHub repo pushed with latest changes
- 10 minutes

### Step 1: Create App
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Choose **"GitHub"** as source
4. Select your repository: `MintShards/tool-parts-finder`
5. Branch: `main`
6. Click **"Next"**

### Step 2: Configure Backend Service
DigitalOcean will auto-detect your app. Configure the **backend**:

**Component Type**: Web Service
**Name**: `backend`
**Source Directory**: `/backend`
**Build Command**: `pip install -r requirements.txt`
**Run Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8080`
**Port**: `8080`
**Instance Size**: Basic ($5/month)

**Environment Variables**:
```
HOST=0.0.0.0
PORT=8080
CORS_ORIGINS=${APP_URL}
OPENAI_API_KEY=  (leave empty for Phase 1)
```

### Step 3: Configure Frontend Static Site
Configure the **frontend**:

**Component Type**: Static Site
**Name**: `frontend`
**Source Directory**: `/frontend`
**Build Command**: `npm install && npm run build`
**Output Directory**: `/dist`

**Environment Variables**:
```
VITE_API_URL=${backend.PUBLIC_URL}
```

This auto-links frontend → backend!

### Step 4: Deploy!
1. Review configuration
2. Click **"Create Resources"**
3. Wait 5-10 minutes for initial build
4. Done! ✅

Your app will be live at:
- Frontend: `https://tool-parts-finder-xxxxx.ondigitalocean.app`
- Backend: `https://backend-xxxxx.ondigitalocean.app`

---

## 🔧 Alternative: Use Config File

We've included `.do/app.yaml` for automated deployment.

### Deploy via doctl CLI
```bash
# Install doctl
snap install doctl

# Authenticate
doctl auth init

# Create app from config
doctl apps create --spec .do/app.yaml

# Check deployment status
doctl apps list
```

---

## 🌐 Custom Domain (Optional)

### Add Your Domain
1. Go to your app in DigitalOcean dashboard
2. Click **"Settings"** → **"Domains"**
3. Click **"Add Domain"**
4. Enter your domain: `toolparts.yourdomain.com`

### Update DNS
Add CNAME record at your DNS provider:
```
Type: CNAME
Name: toolparts
Value: <your-app>.ondigitalocean.app
TTL: 3600
```

SSL certificate auto-provisions in ~5 minutes!

---

## 📊 What Gets Deployed

### Backend API (`/backend`)
- FastAPI server for query parsing
- Generates vendor search URLs
- **No database operations** (all data in browser localStorage)
- Health check endpoint at `/`

### Frontend App (`/frontend`)
- React SPA with Vite build
- localStorage service for history/favorites
- Export/import functionality
- All vendor search logic

---

## 🔄 Auto-Deployment

Every push to `main` branch triggers automatic deployment:
```bash
git push origin main
# DigitalOcean automatically:
# 1. Pulls latest code
# 2. Builds backend + frontend
# 3. Deploys both components
# 4. ~3-5 minutes deployment time
```

---

## 🐛 Troubleshooting

### Backend Build Fails
**Check**: `backend/requirements.txt` is up to date
```bash
cd backend
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update requirements.txt"
git push
```

### Frontend Build Fails
**Check**: Node.js version compatibility
- Go to app settings → frontend component
- Set **Node.js Version**: `20.x`
- Trigger manual deploy

### CORS Errors
**Check**: Backend environment variable `CORS_ORIGINS`
- Should include frontend URL
- Format: `https://tool-parts-finder-xxxxx.ondigitalocean.app`
- Comma-separated for multiple origins

### API Connection Issues
**Check**: Frontend `VITE_API_URL` environment variable
- Should point to backend service
- Use `${backend.PUBLIC_URL}` for auto-configuration
- Rebuild frontend after changing

---

## 💰 Cost Optimization

### Current Setup: ~$5-12/month
- Backend: $5/month (basic-xxs, sufficient for 1000s of requests/day)
- Frontend: $3/month (or FREE on Netlify/Vercel)
- Database: $0 (localStorage!)

### Scale Up (if needed later)
- Backend: $12/month (basic-xs) for higher traffic
- Frontend: Static sites scale automatically
- Database: Still $0 until Phase 2+

### Alternative: Hybrid Deployment (Cheapest)
**Total Cost: $5/month**
- Backend: DigitalOcean App Platform ($5/month)
- Frontend: Netlify/Vercel FREE tier
- Database: $0 (localStorage)

Deploy frontend separately:
```bash
cd frontend
npm run build
netlify deploy --prod  # or vercel --prod
```

Update `VITE_API_URL` to point to DigitalOcean backend.

---

## 🔒 Security Notes

### Environment Variables
- Never commit `.env` file to Git (already in `.gitignore`)
- Set all secrets in DigitalOcean dashboard
- OPENAI_API_KEY not needed for Phase 1

### HTTPS/SSL
- Automatic SSL certificates via Let's Encrypt
- Enforced HTTPS on all connections
- No configuration needed!

### Data Privacy
- All user data (history, favorites) stored in browser localStorage
- Data never sent to server
- Privacy-first architecture ✅

---

## 📈 Monitoring

### DigitalOcean Dashboard
- Real-time logs for backend
- Build logs for deployments
- Resource usage metrics
- Error tracking

### Check Backend Health
```bash
curl https://backend-xxxxx.ondigitalocean.app/
# Should return: {"status": "healthy"}
```

### Check Frontend
Visit your app URL in browser:
- Search should work immediately
- Check browser console for errors
- Test localStorage persistence (search history, favorites)

---

## 🔄 Rollback

If deployment fails:
1. Go to app dashboard
2. Click **"Activity"** tab
3. Find last successful deployment
4. Click **"Rollback"** button

Or via CLI:
```bash
doctl apps list-deployments <app-id>
doctl apps create-deployment <app-id> --deployment-id <previous-id>
```

---

## 📝 Maintenance

### Update Dependencies
```bash
# Backend
cd backend
pip install --upgrade package-name
pip freeze > requirements.txt
git commit -am "Update backend dependencies"
git push

# Frontend
cd frontend
npm update
git commit -am "Update frontend dependencies"
git push
```

### View Logs
```bash
# Via CLI
doctl apps logs <app-id> --type=run --follow

# Or via dashboard: App → Components → View Logs
```

---

## 🆘 Support

**DigitalOcean Docs**: https://docs.digitalocean.com/products/app-platform/
**Community**: https://www.digitalocean.com/community/
**Status Page**: https://status.digitalocean.com/

**App-Specific Issues**:
1. Check build logs in DigitalOcean dashboard
2. Verify environment variables
3. Test backend health endpoint
4. Check browser console for frontend errors

---

## ✅ Post-Deployment Checklist

- [ ] Frontend loads successfully
- [ ] Search functionality works
- [ ] Backend API responds (check network tab)
- [ ] localStorage persists (search history, favorites)
- [ ] Export/import feature works
- [ ] All vendor tabs open correctly
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (https://)
- [ ] Monitor first 24 hours for errors

---

**Need help?** Check the logs first, then review this guide. Most issues are environment variable or CORS misconfigurations.

**Deployment time**: 5-10 minutes for initial setup, 3-5 minutes for updates.

🚀 **You're ready to deploy!**
