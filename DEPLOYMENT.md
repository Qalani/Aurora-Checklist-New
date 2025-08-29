# Deployment Guide for Aurora Checklist App 🚀

This guide will help you deploy your Aurora Checklist app to Vercel with Supabase integration.

## Prerequisites ✅

- GitHub account
- Vercel account (free tier available)
- Supabase account (free tier available)

## Step 1: Prepare Your Repository 📁

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: Aurora Checklist App"
   git push origin main
   ```

2. **Verify your repository structure**
   ```
   aurora-checklist/
   ├── src/
   │   ├── app/
   │   ├── components/
   │   ├── lib/
   │   └── types/
   ├── database/
   ├── .env.local
   ├── package.json
   └── README.md
   ```

## Step 2: Set Up Supabase 🗄️

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: `aurora-checklist`
   - Set a secure database password
   - Choose a region close to your users
   - Click "Create new project"

2. **Wait for Setup**
   - Project setup takes 1-2 minutes
   - You'll receive an email when ready

3. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy your Project URL
   - Copy your anon/public key
   - Copy your service_role key (keep this secret!)

4. **Set Up Database Schema**
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `database/schema.sql`
   - Paste and run the SQL script
   - Verify tables are created in the Table Editor

## Step 3: Deploy to Vercel 🌐

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your `aurora-checklist` repository

2. **Configure Project**
   - Project Name: `aurora-checklist` (or your preferred name)
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add the following variables:
   
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: [Your Supabase Project URL]
   Environment: Production, Preview, Development
   
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: [Your Supabase Anon Key]
   Environment: Production, Preview, Development
   
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: [Your Supabase Service Role Key]
   Environment: Production, Preview, Development
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

## Step 4: Configure Supabase Authentication 🔐

1. **Enable Email Auth**
   - Go to Authentication → Settings in Supabase
   - Enable "Enable email confirmations"
   - Add your domain to "Site URL" (your Vercel URL)
   - Add your Vercel URL to "Redirect URLs"

2. **Set Up RLS Policies**
   - The SQL script already includes RLS policies
   - Verify they're working in the Table Editor

## Step 5: Test Your Deployment 🧪

1. **Visit Your App**
   - Go to your Vercel URL
   - Test creating tasks
   - Test drag and drop
   - Test categories and priorities

2. **Check Console for Errors**
   - Open browser dev tools
   - Look for any console errors
   - Verify Supabase connections

## Step 6: Custom Domain (Optional) 🌍

1. **Add Custom Domain**
   - In Vercel, go to your project settings
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Supabase Settings**
   - Add your custom domain to Supabase auth settings
   - Update redirect URLs

## Troubleshooting 🔧

### Common Issues

1. **Build Errors**
   - Check that all dependencies are in `package.json`
   - Verify TypeScript compilation
   - Check for missing environment variables

2. **Supabase Connection Issues**
   - Verify environment variables in Vercel
   - Check Supabase project status
   - Verify RLS policies are enabled

3. **Authentication Issues**
   - Check Supabase auth settings
   - Verify redirect URLs
   - Check browser console for CORS errors

### Environment Variable Issues

If you get environment variable errors:
1. Double-check variable names in Vercel
2. Ensure all environments are selected
3. Redeploy after adding variables

### Database Connection Issues

If tasks aren't saving:
1. Check Supabase table structure
2. Verify RLS policies
3. Check browser network tab for API calls

## Monitoring & Analytics 📊

1. **Vercel Analytics**
   - Enable in project settings
   - Monitor performance and errors

2. **Supabase Monitoring**
   - Check database performance
   - Monitor API usage
   - Set up alerts for errors

## Security Best Practices 🔒

1. **Environment Variables**
   - Never commit `.env.local` to Git
   - Use Vercel's environment variable system
   - Rotate keys regularly

2. **Supabase Security**
   - Keep service role key secret
   - Use RLS policies
   - Monitor API usage

3. **App Security**
   - Validate all inputs
   - Sanitize data
   - Use HTTPS only

## Next Steps 🚀

After successful deployment:

1. **Set up monitoring**
2. **Configure backups**
3. **Set up CI/CD pipeline**
4. **Add custom features**
5. **Optimize performance**

## Support 💬

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs
3. Review browser console errors
4. Open GitHub issues
5. Check Vercel and Supabase documentation

---

Happy Deploying! ✨🚀
