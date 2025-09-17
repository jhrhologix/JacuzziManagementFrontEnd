// Run this in your browser console to add existing Cloudinary images to localStorage

const addExistingImages = () => {
  const serviceCallNumber = 'SS042048';
  const cloudName = 'dmp6byebm';
  
  // Your existing images with proper naming convention
  const existingImages = [
    {
      publicId: `service-calls/${serviceCallNumber}/SS042048_FrancoisM_20250917_1758074139280`,
      url: `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/service-calls/${serviceCallNumber}/SS042048_FrancoisM_20250917_1758074139280`,
      thumbnailUrl: `https://res.cloudinary.com/${cloudName}/image/upload/w_200,h_200,c_fill,q_auto,f_auto/service-calls/${serviceCallNumber}/SS042048_FrancoisM_20250917_1758074139280`,
      uploadedBy: 'technician'
    },
    {
      publicId: `service-calls/${serviceCallNumber}/SS042048_Jonathan_20250917_1758074046219`,
      url: `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/service-calls/${serviceCallNumber}/SS042048_Jonathan_20250917_1758074046219`,
      thumbnailUrl: `https://res.cloudinary.com/${cloudName}/image/upload/w_200,h_200,c_fill,q_auto,f_auto/service-calls/${serviceCallNumber}/SS042048_Jonathan_20250917_1758074046219`,
      uploadedBy: 'admin'
    }
  ];
  
  // Save to localStorage
  const storageKey = `cloudinary_images_${serviceCallNumber}`;
  localStorage.setItem(storageKey, JSON.stringify(existingImages));
  
  console.log('✅ Added existing images to localStorage');
  console.log('Images added:', existingImages.length);
  console.log('Storage key:', storageKey);
  
  // Verify it was saved
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    console.log('✅ Verification: Images successfully saved to localStorage');
    console.log('Saved data:', JSON.parse(saved));
  }
};

// Run the function
addExistingImages();

// Instructions:
console.log('📋 Instructions:');
console.log('1. Copy this entire script');
console.log('2. Open browser console on your admin or technician page');
console.log('3. Paste and run this script');
console.log('4. Refresh the page');
console.log('5. Images should now appear!');
