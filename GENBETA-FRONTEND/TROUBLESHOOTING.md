# Troubleshooting Guide

## Issue: Blank Page / CSP Blocking eval

### Solution 1: Disable Brave Shields (Recommended for Development)

If you're using **Brave browser**:

1. Click the **Brave lion icon** (🛡️) in the address bar
2. Toggle **Shields** to **OFF** for `localhost:5173`
3. Reload the page (F5 or Ctrl+R)

### Solution 2: Use Chrome/Edge for Development

Brave's Shields can be strict. For development, consider using:
- **Google Chrome**
- **Microsoft Edge**
- **Firefox**

These browsers won't block Vite's development features.

### Solution 3: CSP Already Added

I've added a development-friendly CSP to `index.html` that allows:
- `'unsafe-eval'` - Required for Vite dev mode
- `'unsafe-inline'` - Required for inline styles
- Localhost connections for API calls

**Note:** This CSP is only safe for development. For production, we'll use a stricter CSP.

### Solution 4: Check Browser Console

1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for errors like:
   - `Refused to evaluate a string as JavaScript`
   - `Content Security Policy`

### Quick Fix Checklist

✅ Disable Brave Shields OR use Chrome/Edge  
✅ Hard refresh: `Ctrl + Shift + R`  
✅ Check console for errors  
✅ Verify backend server is running on port 5000  
✅ Verify frontend server is running (check terminal)

## Other Common Issues

### Port Already in Use
If port 5173 is busy, Vite will use the next available port (5174, 5175, etc.)

### CORS Errors
Make sure backend server is running and has been restarted after CORS config update.

### MongoDB Connection
Ensure MongoDB is running and connection string in `.env` is correct.




