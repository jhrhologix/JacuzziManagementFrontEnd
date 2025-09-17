# Create Cloudinary Upload Preset

## Quick Setup (2 minutes):

1. **Go to your Cloudinary Dashboard**: https://console.cloudinary.com/console/settings/upload
2. **Click "Add upload preset"**
3. **Configure the preset**:
   - **Preset name**: `jacuzzi_unsigned`
   - **Signing Mode**: `Unsigned` ⚠️ **IMPORTANT**
   - **Folder**: `service-calls` (optional, for organization)
   - **Allowed formats**: `jpg,png,jpeg,heic,heif,webp`
   - **Max file size**: `10000000` (10MB)
   - **Auto tagging**: `service_call,jacuzzi`
4. **Click "Save"**

## Alternative: Quick API Setup
If you prefer, I can create the preset via API. Just run this in your browser console on the Cloudinary dashboard:

```javascript
fetch('https://api.cloudinary.com/v1_1/dmp6byebm/upload_presets', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa('663289219335958:JIL5yTTirrq1TfzVA5fEIv4OwvY'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'jacuzzi_unsigned',
    unsigned: true,
    folder: 'service-calls',
    allowed_formats: 'jpg,png,jpeg,heic,heif,webp',
    max_file_size: 10000000,
    tags: 'service_call,jacuzzi'
  })
})
.then(response => response.json())
.then(data => console.log('Upload preset created:', data));
```

Once you've created the preset, I'll integrate Cloudinary into your components!
