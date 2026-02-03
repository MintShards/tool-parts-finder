# 🚀 START HERE - Your Personal Quick Start

## ✅ Step 1: Update MongoDB Password (REQUIRED)

You need to replace `<PASSWORD>` in your MongoDB connection string.

**File to edit**: `backend/.env`

**Find this line**:
```
MONGODB_URI=mongodb+srv://tool-parts-finder-user:<PASSWORD>@prod-cluster.xxxxx.mongodb.net/tool_parts_finder?retryWrites=true&w=majority
```

**Replace `<PASSWORD>` with your actual MongoDB Atlas password**.

### How to find your MongoDB password:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Log in to your account
3. Click **Database Access** (left sidebar)
4. Your username is: `tool-parts-finder-user`
5. Click **Edit** next to the user
6. Click **Edit Password**
7. Either view current password or set a new one
8. Copy the password
9. Replace `<PASSWORD>` in the `.env` file

**Example** (with fake password):
```
# Before
MONGODB_URI=mongodb+srv://tool-parts-finder-user:<PASSWORD>@prod-cluster.xxxxx.mongodb.net/...

# After (if your password is "MySecurePass123")
MONGODB_URI=mongodb+srv://tool-parts-finder-user:MySecurePass123@prod-cluster.xxxxx.mongodb.net/...
```

---

## ✅ Step 2: Start the Application

### Option A: Quick Start (Recommended for First Time)

**Terminal 1 - Backend**:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Wait for this message:
```
✅ Connected to MongoDB: tool_parts_finder
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Terminal 2 - Frontend** (open new terminal):
```bash
cd frontend
npm install
npm run dev
```

Wait for this message:
```
➜  Local:   http://localhost:5173/
```

### Option B: Using Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

Then follow the same terminal commands above.

---

## ✅ Step 3: Test the Application

1. Open browser to: **http://localhost:5173**
2. You should see the Tool Parts Finder interface
3. Try a test search: `Ingersoll Rand 2135 trigger valve`
4. Click **Search**
5. Multiple tabs should open automatically with vendor results (see VENDORS.md for complete list)

---

## 🐛 Troubleshooting

### "Failed to connect to MongoDB"

**Problem**: Password not updated in `.env` file

**Fix**:
1. Open `backend/.env`
2. Replace `<PASSWORD>` with your actual MongoDB password
3. Make sure there are NO spaces around the password
4. Restart the backend server (Ctrl+C, then `uvicorn app.main:app --reload`)

### "IP not whitelisted"

**Problem**: Your IP address isn't allowed to connect to MongoDB Atlas

**Fix**:
1. Go to MongoDB Atlas
2. Click **Network Access** (left sidebar)
3. Click **Add IP Address**
4. Click **Allow Access from Anywhere** (for development)
5. Click **Confirm**
6. Wait 1-2 minutes for changes to apply
7. Restart backend server

### "Port already in use"

**Fix**:
```bash
# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Tabs not opening

**Fix**:
1. Check browser popup blocker settings
2. Allow popups for `localhost:5173`
3. Reload the page and try again

---

## 📝 What to Do After Testing

### If Everything Works ✅

1. **Share with your team** for testing
2. **Collect feedback** on features and usability
3. **Plan production deployment** (see `DEPLOYMENT.md`)
4. **Consider Phase 2 features** (AI PDF extraction)

### If You Need Help 🆘

Check these files in order:
1. **CHEATSHEET.md** - Common commands and fixes
2. **README.md** - Full technical documentation
3. **ARCHITECTURE.md** - How the system works
4. **VENDORS.md** - Supported vendors list

---

## 🎯 Quick Test Checklist

After starting the app, test these features:

- [ ] Search for a part (e.g., "Ingersoll Rand 2135 trigger valve")
- [ ] Verify multiple tabs open with vendor results
- [ ] Click "Add Current" to create a favorite
- [ ] Reload page, verify favorite persists
- [ ] Click favorite chip to re-search
- [ ] Check search history in left sidebar (desktop)
- [ ] Try search on mobile/tablet (responsive design)

---

## 🔐 Security Note

**NEVER commit `.env` file to Git!**

The `.gitignore` file already excludes it, but double-check:
```bash
git status
# Should NOT show backend/.env
```

---

## 🚀 Next Steps After Local Testing

1. **Team Testing** (1-2 days)
   - Have 2-3 team members test
   - Collect feedback on usability
   - Note any missing vendors or features

2. **Production Deployment** (1 hour)
   - Follow `DEPLOYMENT.md` for DigitalOcean + Hostinger
   - Cost: $6/month for backend
   - Your Hostinger hosting handles frontend

3. **Training** (30 minutes)
   - Show team how to search
   - Explain favorites and history
   - Demonstrate time savings

4. **Plan Phase 2** (Future)
   - AI PDF extraction for part diagrams
   - Cross-brand equivalent parts
   - Pricing display
   - Learning from order patterns

---

## 💡 Pro Tips

1. **Add frequently used parts as favorites** - saves even more time
2. **Use search history** for recent searches - no retyping
3. **Star parts right after first search** - builds your favorites library
4. **Check all tabs** - prices and availability vary by vendor
5. **Bookmark localhost:5173** - quick access during development

---

## 📞 Need Help?

**Documentation Files** (in order of usefulness):
- `START_HERE.md` ← You are here
- `CHEATSHEET.md` - Quick commands
- `README.md` - Full documentation
- `DEPLOYMENT.md` - Production deployment
- `ARCHITECTURE.md` - System design
- `STATUS.md` - Project status
- `VENDORS.md` - Supported vendors

**Can't find the answer?** Check CHEATSHEET.md for common errors and solutions.

---

## ✅ Success Checklist

- [ ] MongoDB password updated in `backend/.env`
- [ ] Backend running without errors
- [ ] Frontend running on http://localhost:5173
- [ ] Test search works (6 tabs open)
- [ ] Favorites can be added/removed
- [ ] Search history displays
- [ ] Team has tested the app

Once all checked ✅ - you're ready for production!

---

**🎉 You're almost there! Just update the MongoDB password and start the servers!**

**Total setup time: ~10 minutes** ⏱️
