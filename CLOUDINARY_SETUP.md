# Cloudinary Setup Instructions

## 1. Create Cloudinary Account
1. Go to https://cloudinary.com/
2. Sign up for a free account
3. Verify your email

## 2. Get Your Credentials
1. Go to your Cloudinary Dashboard
2. Copy these values:
   - **Cloud name** (e.g., "your-company-name")
   - **API Key** (e.g., "123456789012345")

## 3. Create Upload Preset
1. Go to Settings > Upload
2. Click "Add upload preset"
3. Set:
   - **Preset name**: `jacuzzi_service_calls`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `service-calls` (optional, for organization)
   - **Allowed formats**: `jpg,png,jpeg,heic,heif`
   - **Max file size**: `10MB`
4. Save the preset

## 4. Update Environment Configuration
Update `src/environments/environment.development.ts`:

```typescript
cloudinary: {
  cloudName: 'your-actual-cloud-name',        // From dashboard
  uploadPreset: 'jacuzzi_service_calls',      // The preset you created
  apiKey: 'your-actual-api-key'               // From dashboard
}
```

## 5. Benefits of This Approach

✅ **Immediate deletion**: Images deleted instantly when × is clicked
✅ **No server storage**: Images stored on Cloudinary's CDN
✅ **Automatic optimization**: Images automatically resized/compressed
✅ **Global CDN**: Fast loading worldwide
✅ **Backup & recovery**: Built-in redundancy
✅ **Easy integration**: Simple API calls
✅ **Free tier**: 25GB storage, 25GB bandwidth/month

## 6. Usage in Components

```typescript
// Upload image
const result = await this.cloudinaryService.uploadImage(file, 'service-calls');
console.log('Image uploaded:', result.url);

// Delete image immediately
await this.cloudinaryService.deleteImage(publicId);
console.log('Image deleted');

// Get optimized URL
const optimizedUrl = this.cloudinaryService.getOptimizedImageUrl(publicId, {
  width: 800,
  quality: 'auto'
});
```

## 7. Next Steps
1. Set up your Cloudinary account
2. Update the environment file with real credentials
3. I'll help you integrate it into your service call components
