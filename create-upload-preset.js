// Run this in your browser console on any page to create the upload preset
// Or run with Node.js: node create-upload-preset.js

const createUploadPreset = async () => {
  const cloudName = 'dmp6byebm';
  const apiKey = '663289219335958';
  const apiSecret = 'JIL5yTTirrq1TfzVA5fEIv4OwvY';
  
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload_presets`;
  
  const credentials = btoa(`${apiKey}:${apiSecret}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'jacuzzi_unsigned',
        unsigned: true,
        folder: 'service-calls',
        allowed_formats: ['jpg', 'png', 'jpeg', 'heic', 'heif', 'webp'],
        max_file_size: 10000000, // 10MB
        tags: ['service_call', 'jacuzzi'],
        // Remove context for now - we'll add it during upload
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload preset created successfully!');
      console.log('Preset name:', data.name);
      console.log('Settings:', data.settings);
    } else {
      console.error('❌ Error creating preset:', data);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Run the function
createUploadPreset();
