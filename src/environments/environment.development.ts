export const environment = {
     production: false, 
     apiUrl: 'https://localhost:7159', 
     pageSizeList: [5, 10, 25, 50], 
     defaultPageSize: 50,
     cloudinary: {
       cloudName: 'dmp6byebm',
       uploadPreset: 'jacuzzi_unsigned', // We'll create this preset
       apiKey: '663289219335958'
     }
    };