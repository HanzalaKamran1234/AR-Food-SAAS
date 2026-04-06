# 🚀 AR Food Viewer SaaS — DEPLOY NOW Guide
## (Everything is coded — just follow these 5 steps)

---

## ✅ WHAT'S ALREADY DONE
- All code complete (Phases 1–11)
- GitHub pushed: https://github.com/HanzalaKamran1234/AR-Food-SAAS
- Firebase project: `ecstatic-parsec-460011-q6`
- Firebase frontend config: injected ✅
- Vite build: passing ✅

---

## STEP 1 — Firebase Console (5 minutes)
**Login: h25887098@gmail.com at https://console.firebase.google.com**

### 1A — Enable Email/Password Auth
👉 Go to: https://console.firebase.google.com/project/ecstatic-parsec-460011-q6/authentication/providers
- Click **Email/Password**
- Toggle first switch → **Enabled**
- Click **Save** ✅

### 1B — Enable Storage + Set Rules
👉 Go to: https://console.firebase.google.com/project/ecstatic-parsec-460011-q6/storage
- Click **Get Started** → **Start in production mode** → **Next** → **Done**
- Click **Rules** tab → Replace with:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}
```
- Click **Publish** ✅

### 1C — Generate Service Account Private Key
👉 Go to: https://console.firebase.google.com/project/ecstatic-parsec-460011-q6/settings/serviceaccounts/adminsdk
- Click **Generate new private key** → **Generate Key**
- A JSON file downloads — **open it** and note these 3 values:
  - `project_id` → your FIREBASE_PROJECT_ID
  - `client_email` → your FIREBASE_CLIENT_EMAIL  
  - `private_key` → your FIREBASE_PRIVATE_KEY (the long RSA key)

---

## STEP 2 — MongoDB Atlas (5 minutes)
👉 Go to: https://www.mongodb.com/atlas/database → Sign up free

1. **Build a Database** → **Free (M0)** → Create
2. **Database Access** → Add New User:
   - Username: `arfoodadmin`
   - Password: choose something, save it
   - Role: **Read and Write to Any Database**
3. **Network Access** → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
4. **Database** → **Connect** → **Drivers** → Copy connection string
5. Replace `<password>` with your password, add `/ar-saas` before `?`:
```
mongodb+srv://arfoodadmin:YOURPASS@cluster0.xxxxx.mongodb.net/ar-saas?retryWrites=true&w=majority
```

---

## STEP 3 — Render Backend Deploy (5 minutes)
👉 Go to: https://render.com → Sign up with GitHub

1. **New +** → **Web Service**
2. Connect GitHub → Select **AR-Food-SAAS** repo
3. Settings:
   | Field | Value |
   |-------|-------|
   | Root Directory | `server` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | Free |

4. Add these **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `PORT` | `5000` |
   | `MONGO_URI` | Your Atlas connection string from Step 2 |
   | `FIREBASE_PROJECT_ID` | `ecstatic-parsec-460011-q6` |
   | `FIREBASE_CLIENT_EMAIL` | From service account JSON |
   | `FIREBASE_PRIVATE_KEY` | The full private key from JSON (including BEGIN/END lines) |

5. Click **Create Web Service** — wait ~3 mins
6. Copy your live URL: `https://ar-food-viewer-backend-XXXX.onrender.com`

---

## STEP 4 — Update Frontend with Render URL
After you get your Render URL, run this in PowerShell:
```powershell
# Open d:\AR Project SAAS\client\src\utils\config.js
# Change line 8 to your real Render URL:
# const PROD_BACKEND_URL = 'https://YOUR-RENDER-URL.onrender.com';
```
Then commit and push:
```powershell
cd "d:\AR Project SAAS"
git add .
git commit -m "set production backend URL"
git push origin main
```

---

## STEP 5 — Vercel Frontend Deploy (2 minutes)
👉 Go to: https://vercel.com → Sign up with GitHub

1. **Add New** → **Project** → Import `AR-Food-SAAS`
2. Settings:
   | Field | Value |
   |-------|-------|
   | Root Directory | `client` |
   | Framework | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
3. Click **Deploy** 🚀
4. Your live HTTPS URL: `https://ar-food-saas.vercel.app`

---

## STEP 6 — First Login (Set Admin Role)
1. Open your Vercel URL → Register an account with your email
2. In MongoDB Atlas → **Browse Collections** → `users` collection
3. Find your user document → Edit `role` field → Change to `"Admin"`
4. Log back in → You'll see the Admin Dashboard

---

## 🏁 ALL DONE! Your live app is at your Vercel URL.
