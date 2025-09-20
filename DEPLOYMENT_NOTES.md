# 🚀 Frontend Deployment Guide

## ⚠️ IMPORTANT: Environment Configuration Before Production Builds

### Before building for production deployment:

1. **Open**: `src/environments/environment.ts`

2. **Ensure these settings**:
   ```typescript
   export const environment = {
     production: true,  // MUST be true for production builds
     apiUrl: 'https://jacuzzimanagement.rhologix.com/Backend',  // Production API URL
   };
   ```

3. **For development builds**, switch to:
   ```typescript
   export const environment = {
     production: false,  // Set to false for development
     //apiUrl: 'https://jacuzzimanagement.rhologix.com/Backend',  // Comment out production
     apiUrl: 'https://localhost:7159',  // Uncomment development URL
   };
   ```

## 🔄 Quick Switch Guide

### For PRODUCTION Deployment:
```typescript
production: true,
apiUrl: 'https://jacuzzimanagement.rhologix.com/Backend',
//apiUrl: 'https://localhost:7159',  // Comment out development
```

### For DEVELOPMENT/Testing:
```typescript
production: false,
//apiUrl: 'https://jacuzzimanagement.rhologix.com/Backend',  // Comment out production
apiUrl: 'https://localhost:7159',  // Uncomment development
```

## 📋 Production Build Commands

```bash
# Build for production
ng build --configuration=production

# Or use the npm script
npm run build --prod
```

## 🎯 Why This Matters

- **production: true** ensures Angular uses production optimizations
- **Correct apiUrl** prevents localhost connection errors in production
- **Environment switching** allows easy development vs production builds

## 🔍 Troubleshooting

If you see `localhost:7159` errors in production:
1. Check `environment.ts` has `production: true`
2. Check `environment.ts` has correct production `apiUrl`
3. Rebuild with `ng build --configuration=production`
4. Clear browser cache after deployment

---
*Last updated: September 2025 - After fixing Cloudinary API key configuration*
