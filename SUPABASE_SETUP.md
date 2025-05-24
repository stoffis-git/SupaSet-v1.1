# SupaSet - User Management Setup Guide

## 🚀 Quick Setup Steps

### 1. **Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for it to finish setting up (2-3 minutes)

### 2. **Get Your Credentials**
1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public key**

### 3. **Set Up Environment Variables**
Create a `.env` file in your project root:

```bash
# Copy .env.example and fill in your values
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_ENV=development
```

### 4. **Set Up Database**
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `database-setup.sql`
3. Click **Run** to create all tables and security policies

### 5. **Configure Authentication**
1. Go to **Authentication** → **Settings**
2. Configure these settings:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173/**`
   - Enable **Email confirmation** (recommended)

### 6. **Test Your Setup**
```bash
npm run dev
```

## 🎯 **How It Works**

### **Anonymous vs Authenticated Users**

**Anonymous Users (Guest Mode):**
- Data stored in localStorage
- No cross-device sync
- All current functionality works
- URL: `http://localhost:5173/`

**Authenticated Users:**
- Data stored in Supabase
- Cross-device sync
- Persistent data backup
- URL: `http://localhost:5173/app/`

### **Data Migration**
When users sign up, they can import their localStorage data:
1. Export from localStorage
2. Import to their new account
3. Seamless transition

### **URL Structure**
```
/                     → Guest mode (localStorage)
/auth                 → Login/signup page
/app/*                → Authenticated user routes (Supabase)
/app/                 → Home (authenticated)
/app/exercises        → Exercises (authenticated)
/app/workout/:id      → Workout (authenticated)
```

## 🔒 **Security Features**

- **Row Level Security (RLS)**: Users can only access their own data
- **Authentication**: Secure email/password auth via Supabase
- **Data Isolation**: Complete separation between users
- **Backup**: Data is safely stored in PostgreSQL

## 🛠 **Development vs Production**

### **Development Setup**
- Uses localhost URLs
- Email confirmation optional
- Local development environment

### **Production Setup** (when you deploy)
- Update Site URL to your domain
- Enable email confirmation
- Set up custom domain (optional)
- Configure production environment variables

## 🚀 **Deployment Ready**

Your app is now ready for deployment with:
- ✅ User accounts and authentication
- ✅ Cross-device data sync
- ✅ Persistent data storage
- ✅ Guest mode for trial users
- ✅ Data import/export capabilities
- ✅ Secure user data isolation

## 📱 **Publishing Your App**

When ready to publish:

1. **Deploy to Vercel/Netlify:**
   ```bash
   npm run build
   # Deploy dist/ folder
   ```

2. **Update Supabase settings:**
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/**`

3. **Set production environment variables:**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-production-key
   VITE_APP_ENV=production
   ```

## 🎉 **You're Done!**

Your SupaSet app now has:
- Professional user management
- Secure data storage
- Cross-device synchronization
- Guest mode for trials
- Production-ready architecture

Users can create accounts, sync data across devices, and never lose their workout history again! 