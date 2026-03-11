# MongoDB Connection Troubleshooting Guide

## ✅ Fixed Connection String

**Updated `.env` file:**
```bash
MONGO_URI=mongodb+srv://aravind:Aravind123@cluster0.x2c1o.mongodb.net/genbata?retryWrites=true&w=majority
```

---

## 🔧 If Connection Still Fails

### Issue 1: IP Address Not Whitelisted

**Symptoms:**
```
MongoServerError: MongoServerError: IP address not whitelisted
```

**Solution:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your cluster → **Network Access**
3. Click **Add IP Address**
4. Either:
   - **Allow Access from Anywhere**: `0.0.0.0/0` (for development)
   - **Add Current IP**: Your specific IP address
5. Click **Confirm**
6. Wait 2-3 minutes for changes to apply

---

### Issue 2: Wrong Password

**Symptoms:**
```
MongoServerError: Authentication failed
```

**Solution:**
1. Go to MongoDB Atlas → **Database Access**
2. Edit user `aravind`
3. Reset password
4. Update `.env` file:
   ```bash
   MONGO_URI=mongodb+srv://aravind:NEW_PASSWORD@cluster0.x2c1o.mongodb.net/genbata?retryWrites=true&w=majority
   ```

---

### Issue 3: Database Name Missing

**Symptoms:**
```
Error: querySrv ECONNREFUSED
```

**Solution:**
Make sure your connection string includes the database name:
```bash
# ❌ WRONG - No database name
mongodb+srv://user:pass@cluster.mongodb.net/

# ✅ CORRECT - Has database name
mongodb+srv://user:pass@cluster.mongodb.net/genbata?retryWrites=true&w=majority
```

---

### Issue 4: Cluster DNS Resolution

**Symptoms:**
```
Error: querySrv ECONNREFUSED _mongodb._tcp.cluster0.x2c1o.mongodb.net
```

**Solution:**
Try using the direct connection string format:
```bash
# Get your connection string from MongoDB Atlas:
# 1. Click "Connect" on your cluster
# 2. Choose "Connect your application"
# 3. Copy the connection string
# 4. Replace <password> with actual password
```

---

## 🧪 Test MongoDB Connection

### Method 1: Using MongoDB Shell
```bash
mongosh "mongodb+srv://aravind:Aravind123@cluster0.x2c1o.mongodb.net/genbata?retryWrites=true&w=majority"
```

### Method 2: Using Node.js Script
Create `test-mongo.js`:
```javascript
const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect('mongodb+srv://aravind:Aravind123@cluster0.x2c1o.mongodb.net/genbata?retryWrites=true&w=majority');
    console.log('✅ MongoDB connected successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

testConnection();
```

Run:
```bash
node test-mongo.js
```

---

## 📋 Connection String Format

**Standard Format:**
```
mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

**Your Current String:**
```
mongodb+srv://aravind:Aravind123@cluster0.x2c1o.mongodb.net/genbata?retryWrites=true&w=majority
```

**Breakdown:**
- `mongodb+srv://` - Protocol
- `aravind:Aravind123` - Username:Password
- `cluster0.x2c1o.mongodb.net` - Cluster URL
- `/genbata` - Database name
- `?retryWrites=true&w=majority` - Options

---

## 🔍 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Network/DNS issue | Check whitelist, use correct URL |
| `Authentication failed` | Wrong credentials | Reset password in Atlas |
| `ENOTFOUND` | DNS resolution failure | Check cluster URL spelling |
| `ETIMEDOUT` | Connection timeout | Check firewall/network |
| `not whitelisted` | IP not allowed | Add IP in Network Access |

---

## 🚀 Quick Fix Checklist

1. ✅ Updated `.env` with correct connection string
2. ✅ Checked MongoDB Atlas is accessible
3. ✅ Verified IP is whitelisted
4. ✅ Confirmed username/password are correct
5. ✅ Restarted backend server (`nodemon` auto-restarts)
6. ✅ Server shows "MongoDB connected successfully"

---

## 📞 Still Having Issues?

### Get Fresh Connection String from Atlas:

1. Login to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Node.js** driver
5. Copy the connection string
6. Replace `<password>` with actual password
7. Paste into `.env` file
8. Restart server

---

## ✅ Success Indicators

When MongoDB connects successfully, you'll see:
```
🚀 Connecting to MongoDB...
✅ MongoDB connected successfully!
📊 Database: genbata
🚀 Server running on port 5000
```

If you still see errors after trying all these steps, check:
- MongoDB Atlas cluster status (should be green)
- Your internet connection
- Firewall settings
- Antivirus blocking connections
