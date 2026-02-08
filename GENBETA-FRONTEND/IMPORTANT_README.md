# ⚠️ IMPORTANT: Brave Browser CSP Issue

## The Problem
Brave browser's **Shields** feature blocks Vite's use of `eval()` in development mode, causing:
- Blank page
- CSP errors in console
- App not loading

## ✅ SOLUTION: Disable Brave Shields

### Method 1: Disable for Localhost (Recommended)

1. **Open your app**: `http://localhost:5173`
2. **Click the Brave lion icon** (🛡️) in the address bar
3. **Toggle "Shields" to OFF**
4. **Reload the page** (F5)

### Method 2: Use Chrome/Edge for Development

Brave Shields can be strict. For development, use:
- ✅ **Google Chrome** (Recommended)
- ✅ **Microsoft Edge**
- ✅ **Firefox**

These browsers won't block Vite's development features.

---

## Why This Happens

Vite uses `eval()` in development for:
- Hot Module Replacement (HMR)
- Fast refresh
- Development tooling

**In production builds**, Vite doesn't use `eval()`, so this won't be an issue.

---

## Quick Test

1. Open Chrome/Edge
2. Navigate to: `http://localhost:5173`
3. App should load immediately ✅

---

## For Production

When you build for production:
```bash
npm run build
```

The production build doesn't use `eval()`, so CSP restrictions won't affect it.

---

## Summary

**For Development:**
- ✅ Disable Brave Shields, OR
- ✅ Use Chrome/Edge

**For Production:**
- ✅ No changes needed (production builds don't use eval)




