# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment (Already Done!)

- [x] Code cleaned and optimized
- [x] 7 working Canadian vendors configured
- [x] Search accuracy improved
- [x] Railway configuration files added
- [x] CORS settings updated for production
- [x] Git repository initialized
- [x] Changes committed

---

## 📦 Step 1: Push to GitHub

- [ ] Open terminal
- [ ] Run: `git push origin main`
- [ ] Verify: Visit https://github.com/MintShards/tool-parts-finder

**Time: 2 minutes**

---

## 🔧 Step 2: Deploy Backend (Railway)

- [ ] Go to https://railway.app
- [ ] Click "Start a New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose "tool-parts-finder" repository
- [ ] Configure Settings:
  - [ ] Root Directory: `backend`
  - [ ] Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Add Environment Variables:
  - [ ] `MONGODB_URI` = (your MongoDB connection string)
  - [ ] `DATABASE_NAME` = `tool_parts_finder`
  - [ ] `PORT` = `8000`
  - [ ] `CORS_ORIGINS` = `*`
- [ ] Generate Domain
- [ ] Copy Railway URL: `https://________.up.railway.app`
- [ ] Test: Open `https://________.up.railway.app/health`

**Time: 5 minutes**

---

## 🎨 Step 3: Deploy Frontend (Vercel)

- [ ] Create `frontend/.env.production`:
  ```
  VITE_API_URL=https://________.up.railway.app
  ```
- [ ] Commit: `git add . && git commit -m "Add production API URL"`
- [ ] Push: `git push origin main`
- [ ] Go to https://vercel.com
- [ ] Click "Import Project"
- [ ] Select "tool-parts-finder" repository
- [ ] Configure:
  - [ ] Framework: Vite
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] Click "Deploy"
- [ ] Copy Vercel URL: `https://tool-parts-finder.vercel.app`

**Time: 5 minutes**

---

## 🔄 Step 4: Update CORS

- [ ] Back to Railway dashboard
- [ ] Click your service → "Variables"
- [ ] Update `CORS_ORIGINS`:
  ```
  CORS_ORIGINS=https://tool-parts-finder.vercel.app,http://localhost:5173
  ```
- [ ] Wait for Railway to redeploy (1 minute)

**Time: 2 minutes**

---

## 🗄️ Step 5: MongoDB Atlas

- [ ] Go to https://cloud.mongodb.com
- [ ] Click "Network Access"
- [ ] Click "Add IP Address"
- [ ] Click "Allow Access from Anywhere"
- [ ] Click "Confirm"

**Time: 2 minutes**

---

## 🧪 Step 6: Testing

- [ ] Open your Vercel URL
- [ ] Search: "makita brush"
- [ ] Verify search results appear
- [ ] Click "Open in New Tab" on each vendor
- [ ] Verify all 7 vendors work:
  - [ ] eBay Canada
  - [ ] Amazon Canada
  - [ ] KMS Tools
  - [ ] Canadian Tire
  - [ ] Home Depot
  - [ ] Contractor Cave
  - [ ] Canada Tool Parts

**Time: 3 minutes**

---

## 🎉 Success Criteria

✅ Backend health check returns `{"status":"healthy"}`
✅ Frontend loads without errors
✅ Search returns 7 vendor results
✅ All vendor tabs open correctly
✅ No CORS errors in browser console

---

## 📝 Save These URLs

**Production Frontend**: `https://________________.vercel.app`

**Production Backend**: `https://________________.up.railway.app`

**MongoDB Atlas**: `https://cloud.mongodb.com`

---

## 📊 Total Time: ~20 minutes

## 💰 Total Cost: $0/month (FREE!)

---

## 🆘 If Something Goes Wrong

1. **Backend not responding**:
   - Check Railway logs
   - Verify `MONGODB_URI` is correct
   - Ensure `PORT` is set to `8000`

2. **Frontend errors**:
   - Check browser console (F12)
   - Verify `VITE_API_URL` matches Railway URL
   - Check CORS settings in Railway

3. **Database connection failed**:
   - MongoDB Atlas → Network Access
   - Make sure "Allow from Anywhere" is enabled

4. **CORS errors**:
   - Update `CORS_ORIGINS` in Railway
   - Include your Vercel URL

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

## 🔄 After Deployment

**To update in the future**:
1. Make code changes locally
2. `git push origin main`
3. Railway and Vercel auto-deploy (2-3 minutes)

**No manual steps needed for updates!**

---

✨ **You got this! Follow the checklist and you'll be live in 20 minutes!** ✨
