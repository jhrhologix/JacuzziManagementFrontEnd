export const environment = {
   // IMPORTANT: For PRODUCTION builds, set production: true and use production API URL
   production: true,  // Set to false for development builds
   
   // PRODUCTION API URL (for live deployment)
   apiUrl: 'https://jacuzzimanagement.rhologix.com/Backend',
   
   // DEVELOPMENT API URL (for local testing) - uncomment and comment out production URL above
   //apiUrl: 'https://localhost:7159',
   
   // STAGING API URL (backup option)
   //apiUrl:'https://ms.stagingsdei.com:4101',       
   
   pageSizeList: [5, 10, 25, 50],
   defaultPageSize: 50,
   cloudinary: {
     cloudName: 'dmp6byebm',
     uploadPreset: 'jacuzzi_unsigned',
     apiKey: '554175892629915'
     // apiSecret removed - should be handled server-side
   },
   encryptionKey: '89e22b8d9e6a3b25cb03211576464d0eebf0e5f3c9c246493eb889e4eedd195a' // New secure key - consider moving to server-side
 };
