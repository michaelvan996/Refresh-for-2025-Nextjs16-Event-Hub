# Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. Environment Variables

Ensure all required environment variables are set in your deployment platform (Vercel, etc.):

**Required:**

- `MONGODB_URI` - MongoDB connection string (use MongoDB Atlas for production)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

**Optional:**

- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host (defaults to https://us.i.posthog.com)
- `NEXT_PUBLIC_SITE_URL` - Production site URL (e.g., https://yourdomain.com)
- `NODE_ENV` - Set to "production" in production

### 2. Build Verification

```bash
npm run build
```

- ✅ Build completes without errors
- ✅ No TypeScript errors (currently ignored in next.config.ts)
- ✅ All pages generate successfully

### 3. Code Quality

- ✅ Removed all `console.log` statements (except error logging)
- ✅ All environment variables validated
- ✅ Error handling in place
- ✅ No hardcoded localhost URLs in production code

### 4. Security

- ✅ Environment variables not committed to git
- ✅ `.env.local` in `.gitignore`
- ✅ Security headers configured in `next.config.ts`
- ✅ API routes have proper error handling
- ✅ Input validation using Zod schemas

### 5. Database

- ✅ MongoDB connection string points to production database (MongoDB Atlas)
- ✅ Database indexes created (if needed)
- ✅ Connection pooling configured

### 6. Image Optimization

- ✅ Cloudinary configured for image uploads
- ✅ Remote image patterns configured in `next.config.ts`
- ✅ Image optimization enabled

### 7. Performance

- ✅ Static pages pre-rendered where possible
- ✅ Dynamic imports for client components (Navbar)
- ✅ Suspense boundaries in place
- ✅ Caching configured

### 8. SEO & Metadata

- ✅ Metadata configured in `app/layout.tsx`
- ✅ Open Graph tags set
- ✅ Twitter Card tags set
- ✅ `NEXT_PUBLIC_SITE_URL` set to production URL

## 🚀 Deployment Steps

### For Vercel:

1. Connect your GitHub repository to Vercel
2. Set all environment variables in Vercel dashboard
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. Deploy

### For Other Platforms:

1. Ensure Node.js version matches (check `package.json` engines if specified)
2. Set all environment variables
3. Run `npm install --production`
4. Run `npm run build`
5. Start with `npm start`

## 📝 Post-Deployment

1. ✅ Verify site loads correctly
2. ✅ Test event creation
3. ✅ Test event booking
4. ✅ Verify database connections
5. ✅ Check image uploads work
6. ✅ Verify analytics (if PostHog configured)
7. ✅ Test all navigation links
8. ✅ Check mobile responsiveness
9. ✅ Verify API endpoints work
10. ✅ Monitor error logs

## 🔧 Troubleshooting

### Build Fails:

- Check environment variables are set
- Verify MongoDB connection string is valid
- Check Cloudinary credentials

### Runtime Errors:

- Check server logs
- Verify database connectivity
- Check API route errors

### Image Issues:

- Verify Cloudinary configuration
- Check remote image patterns in `next.config.ts`

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)
