export const environment = {
   production: true,
   apiUrl: 'https://jacuzzimanagement.rhologix.com/Backend',
   //apiUrl:'https://ms.stagingsdei.com:4101',       
   pageSizeList: [5, 10, 25, 50],
   defaultPageSize: 50,
   cloudinary: {
     cloudName: 'dmp6byebm',
     uploadPreset: 'jacuzzi_unsigned',
     apiKey: '663289219335958'
     // apiSecret removed - should be handled server-side
   },
   encryptionKey: '89e22b8d9e6a3b25cb03211576464d0eebf0e5f3c9c246493eb889e4eedd195a' // New secure key - consider moving to server-side
 };
