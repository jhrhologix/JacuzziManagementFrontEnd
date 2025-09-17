export const environment = {
   production: true,
 apiUrl: 'https://jacuzzimanagement.rhologix.com/Backend',      
   pageSizeList: [5, 10, 25, 50],
   defaultPageSize: 50,
   cloudinary: {
     cloudName: 'dmp6byebm',
     uploadPreset: 'jacuzzi_unsigned',
     apiKey: '663289219335958',
     apiSecret: 'JIL5yTTirrq1TfzVA5fEIv4OwvY' // Only for admin API calls, never exposed to end users
   }
 };
