# 🚀 Deploy to Production NOW - Free ($0/month)

Complete step-by-step guide to deploy in 15 minutes.

---

## 📋 Before You Start

**You'll need**:
1. GitHub account (to connect Railway)
2. MongoDB Atlas connection string (you already have this)
3. A browser

**No CLI installation needed** - We'll use the web dashboards!

---

## Part 1: Deploy Backend to Railway (5 minutes)

### Step 1: Push Code to GitHub (if not already)

```bash
cd /mnt/c/Users/seji\ lamina/Desktop/tool-parts-finder
git init
git add .
git commit -m "Initial commit - ready for deployment"
git branch -M main

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/tool-parts-finder.git
git push -u origin main
```

### Step 2: Deploy to Railway

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Click **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select **tool-parts-finder** repository
6. Railway will detect it's a Python project

### Step 3: Configure Railway

1. Click on your deployed service
2. Go to **"Variables"** tab
3. Add these environment variables:

```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/tool_parts_finder?retryWrites=true&w=majority
DATABASE_NAME=tool_parts_finder
PORT=8000
CORS_ORIGINS=*
```

4. Click **"Settings"** tab:
   - **Root Directory**: `/backend`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. Click **"Deploy"** - Railway will rebuild

### Step 4: Get Your Railway URL

1. Go to **"Settings"** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. Copy your URL: `https://YOUR-APP.up.railway.app`

### Step 5: Test Backend

Open: `https://YOUR-APP.up.railway.app/health`

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "api_version": "1.0.0"
}
```

✅ **Backend deployed!**

---

## Part 2: Deploy Frontend to Vercel (5 minutes)

### Step 1: Update Frontend API URL

In your local project:

```bash
cd frontend
echo "VITE_API_URL=https://YOUR-APP.up.railway.app" > .env.production
```

**Replace `YOUR-APP.up.railway.app` with your Railway URL!**

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Add production API URL"
git push origin main
```

### Step 3: Deploy to Vercel

1. Go to **https://vercel.com**
2. Click **"Import Project"**
3. Select your **tool-parts-finder** repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Click **"Deploy"**

### Step 4: Get Your Vercel URL

After deployment completes (2-3 minutes):
- Copy your URL: `https://tool-parts-finder.vercel.app`

### Step 5: Update Railway CORS

1. Go back to **Railway** dashboard
2. Click your service → **Variables**
3. Update **CORS_ORIGINS**:
```
CORS_ORIGINS=https://tool-parts-finder.vercel.app,http://localhost:5173
```
4. Click **"Deploy"** to restart

✅ **Frontend deployed!**

---

## Part 3: Update MongoDB Atlas (2 minutes)

1. Go to **MongoDB Atlas** (https://cloud.mongodb.com)
2. Click **"Network Access"** (left sidebar)
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"** (or add Railway IP ranges)
5. Click **"Confirm"**

✅ **Database configured!**

---

## Part 4: Test Everything (3 minutes)

1. Open your Vercel URL: `https://tool-parts-finder.vercel.app`
2. Try a search: **"makita brush"**
3. Click **"Open in New Tab"** on a vendor
4. Check that all 7 vendors work

✅ **Production deployment complete!**

---

## 🎉 You're Live!

**Your URLs**:
- **Frontend**: https://tool-parts-finder.vercel.app
- **Backend API**: https://YOUR-APP.up.railway.app
- **Database**: MongoDB Atlas

**Monthly Cost**: **$0** (100% free!)

---

## 📊 What You Get (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Railway** | $5 credit/month | ~500 hours execution |
| **Vercel** | Unlimited deploys | 100GB bandwidth |
| **MongoDB Atlas** | 512MB storage | Sufficient for thousands of searches |

---

## 🔄 How to Update

### Update Backend
1. Make changes to code
2. `git push origin main`
3. Railway auto-deploys (takes 2-3 minutes)

### Update Frontend
1. Make changes to code
2. `git push origin main`
3. Vercel auto-deploys (takes 2-3 minutes)

---

## 🐛 Troubleshooting

### Backend not responding
1. Check Railway logs: Dashboard → Logs
2. Verify MONGODB_URI is correct
3. Check PORT is set to 8000

### Frontend shows errors
1. Open browser console (F12)
2. Check if API URL is correct
3. Verify CORS_ORIGINS in Railway includes your Vercel URL

### Database connection failed
1. MongoDB Atlas → Network Access
2. Make sure "Allow Access from Anywhere" is enabled
3. Verify MONGODB_URI in Railway variables

### CORS errors
1. Railway dashboard → Variables
2. Update CORS_ORIGINS to include your Vercel URL
3. Click "Deploy" to restart

---

## 📈 Monitoring

### Railway Dashboard
- View logs in real-time
- Monitor CPU/memory usage
- Check deployment history

### Vercel Dashboard
- See deployment analytics
- View function logs
- Monitor bandwidth usage

### MongoDB Atlas
- Check connection count
- Monitor storage usage
- View query performance

---

## 💰 When to Upgrade

**Railway Free Tier**: 500 hours/month (20 days)

If you run out:
- **$5/month** for unlimited hours (still cheap!)

**Signs you need to upgrade**:
- Railway service stops mid-month
- "Quota exceeded" message
- High traffic (100+ searches/day)

---

## ✅ Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Railway environment variables set
- [ ] Railway domain generated
- [ ] Backend health check works
- [ ] Frontend .env.production updated
- [ ] Frontend deployed to Vercel
- [ ] Vercel domain generated
- [ ] CORS origins updated in Railway
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Test search works end-to-end
- [ ] All 7 vendors open correctly

---

## 🎯 Next Steps (Optional)

### Add Custom Domain
1. **Vercel**: Settings → Domains → Add Domain
2. **Railway**: Settings → Domains → Add Custom Domain
3. Update DNS records at your domain registrar

### Enable Analytics
1. **Vercel**: Automatic with free tier
2. **Railway**: Available in dashboard

### Set Up Monitoring
1. **UptimeRobot** (free): Monitor uptime
2. **LogRocket** (optional): User session recording

---

## 📞 Support

**Deployment Issues?**
1. Check logs in Railway/Vercel dashboards
2. Verify environment variables
3. Test API endpoint directly: `https://YOUR-APP.up.railway.app/health`

**Need Help?**
- Railway Discord: https://discord.gg/railway
- Vercel Discord: https://discord.gg/vercel

---

## 🚀 Happy Deploying!

Your Tool Parts Finder is now live and accessible worldwide for **$0/month**!
