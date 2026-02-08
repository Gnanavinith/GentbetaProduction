# Fix CSP Error in Brave Browser

## The Problem
Brave browser's **Shields** feature blocks Vite's use of `eval()` in development mode, causing a blank page.

## ✅ Solution: Disable Brave Shields for Localhost

### Step 1: Open your app
Navigate to: `http://localhost:5173` (or your Vite port)

### Step 2: Disable Shields
1. Look for the **Brave lion icon** (🛡️) in the address bar
2. Click on it
3. Toggle **"Shields"** to **OFF**
4. The icon should change to show Shields are disabled

### Step 3: Reload
Press `F5` or `Ctrl + R` to reload the page

### Step 4: Verify
The app should now load correctly!

---

## Alternative: Use Chrome/Edge for Development

Brave Shields can be strict. For development, consider using:
- **Google Chrome** - Recommended
- **Microsoft Edge** - Also works well
- **Firefox** - Good alternative

These browsers won't block Vite's development features.

---

## Why This Happens

Vite uses `eval()` in development mode for:
- Hot Module Replacement (HMR)
- Fast refresh
- Development tooling

In **production builds**, Vite doesn't use `eval()`, so this won't be an issue.

---

## For Production

When you build for production:
```bash
npm run build
```

The production build doesn't use `eval()`, so CSP restrictions won't affect it.

---

## Quick Checklist

✅ Disable Brave Shields for `localhost:5173`  
✅ Reload the page  
✅ App should load correctly  
✅ Or use Chrome/Edge for development




