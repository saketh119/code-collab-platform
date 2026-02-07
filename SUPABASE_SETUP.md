# 🚀 Supabase Setup Guide

## Step-by-Step Instructions

### Step 1: Create Supabase Account & Project

1. **Go to Supabase**
   - Visit: https://supabase.com
   - Click "Start your project" or "Sign In"
   - Sign up with GitHub or Email

2. **Create New Project**
   - Click **"New Project"** button (green button)
   - Select organization (or create one if first time)

3. **Project Settings**
   ```
   Name:              collab-platform
   Database Password: [CREATE STRONG PASSWORD - SAVE IT!]
   Region:            [Choose closest: e.g., US East, Europe, Asia]
   ```
   
4. **Wait for Provisioning** (~2 minutes)
   - You'll see a progress indicator
   - Database will be ready when you see the dashboard

---

### Step 2: Get Your Database Connection String

1. **Navigate to Project Settings**
   - Click the **⚙️ gear icon** in the left sidebar (bottom)
   
2. **Go to Database Section**
   - In settings, click **"Database"** tab
   
3. **Find Connection String**
   - Scroll down to **"Connection String"** section
   - You'll see multiple options

4. **Copy the Right String**
   - Use **"Connection pooling"** (recommended)
   - It looks like:
     ```
     postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
     ```
   - **IMPORTANT**: Replace `[YOUR-PASSWORD]` with the password you created in Step 1

---

### Step 3: Update Your .env.local File

1. **Open the file**
   ```
   collab-platform-v2/.env.local
   ```

2. **Update DATABASE_URL**
   ```bash
   # Replace the entire line with your Supabase connection string:
   DATABASE_URL="postgresql://postgres.abcd...@aws-0-us-east...postgres"
   ```

3. **Generate NEXTAUTH_SECRET**
   
   **Option A - Using Terminal:**
   ```bash
   openssl rand -base64 32
   ```
   
   **Option B - Using Node:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   
   **Option C - Using Website:**
   - Visit: https://generate-secret.vercel.app/32
   - Copy the generated string
   
   **Then update .env.local:**
   ```bash
   NEXTAUTH_SECRET="your-generated-secret-here"
   ```

4. **Final .env.local should look like:**
   ```bash
   DATABASE_URL="postgresql://postgres.xyz:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="abcdefgh123456789randomsecretstring"
   ```

---

### Step 4: Run Database Migrations

Open terminal in your project and run:

```bash
# Navigate to frontend directory
cd collab-platform-v2

# Create database tables
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client
✔ Applied migration(s)
```

---

### Step 5: Verify Database Setup

**Option 1 - Using Prisma Studio:**
```bash
npx prisma studio
```
- Opens at http://localhost:5555
- You should see tables: User, Account, Session, CodeSession, etc.

**Option 2 - Using Supabase Dashboard:**
- Go to Supabase → Table Editor
- You should see all the tables we created

---

### Step 6: Build Docker Runtime Image

```bash
# Navigate to runtime directory
cd ../collab-runtime

# Build the Docker image
docker build -t collab-runtime .
```

**This takes a few minutes.** You should see:
```
Successfully built abc123def456
Successfully tagged collab-runtime:latest
```

---

### Step 7: Start All Services

**Terminal 1 - Yjs Server:**
```bash
cd collab-yjs-server
npm start
```
Should show: `Yjs WebSocket server running on ws://localhost:1234`

**Terminal 2 - Session Manager:**
```bash
cd collab-session-manager
npm start
```
Should show: `Session Manager running on http://localhost:4000`

**Terminal 3 - Frontend:**
```bash
cd collab-platform-v2
npm run dev
```
Should show: `Ready on http://localhost:3000`

---

### Step 8: Test the Application

1. **Open Browser**
   - Go to: http://localhost:3000

2. **Create Account**
   - Click "Get Started"
   - Fill in Name, Email, Password
   - Click "Create Account"

3. **Login**
   - Enter your email and password
   - Click "Sign In"

4. **Create Session**
   - You should see the dashboard
   - Click "New Session"
   - Wait for Docker container to start
   - Start coding!

---

## 🎯 Required Credentials Summary

Here's what you need to provide:

1. ✅ **Supabase Database URL** (from Supabase dashboard)
2. ✅ **NEXTAUTH_SECRET** (generate using openssl or Node)

That's it! No other credentials required for basic setup.

---

## 🐛 Troubleshooting

### "Prisma Client could not connect"
- Double-check DATABASE_URL in .env.local
- Make sure you replaced [YOUR-PASSWORD] with actual password
- Verify Supabase project is active (not paused)

### "Docker build failed"
- Ensure Docker Desktop is running
- Try: `docker system prune -a` then rebuild

### "Failed to start session"
- Check Docker image exists: `docker images | grep collab-runtime`
- Ensure Docker has enough resources (Settings → Resources)

### "NEXTAUTH_SECRET is missing"
- Make sure .env.local exists in collab-platform-v2 folder
- Restart dev server after updating .env.local

---

## ✅ Checklist

Before running the app, verify:

- [ ] Supabase project created
- [ ] Database URL copied and updated in .env.local
- [ ] NEXTAUTH_SECRET generated and updated
- [ ] `npx prisma migrate dev` completed successfully
- [ ] `npx prisma generate` completed successfully
- [ ] Docker image built (`docker images | grep collab-runtime`)
- [ ] All node_modules installed (npm install in each service)

If all checked, you're ready to go! 🚀

---

## 📞 Need Help?

If you get stuck:
1. Check the error message carefully
2. Verify .env.local file exists and has all variables
3. Make sure Docker is running
4. Restart all terminals/services
5. Check database connection in Supabase dashboard

---

## 🎉 Success!

Once everything is running, you should be able to:
- Create an account
- Login to dashboard
- Start coding sessions
- Collaborate in real-time
- Share session links

Enjoy your collaborative coding platform! 🚀
