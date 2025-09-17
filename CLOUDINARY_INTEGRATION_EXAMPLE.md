# Cloudinary Integration Example

## 1. First, create the upload preset in Cloudinary dashboard:
- Go to: https://console.cloudinary.com/console/settings/upload
- Click "Add upload preset"
- Name: `jacuzzi_unsigned`
- Signing Mode: `Unsigned`
- Save

## 2. Update your service call component HTML:

Replace your current image section with:

```html
<!-- Replace the existing photo upload section with this -->
<app-cloudinary-image-manager 
  [serviceCallId]="serviceCallId"
  [folder]="'service-calls'"
  (imagesChanged)="onImagesChanged($event)">
</app-cloudinary-image-manager>
```

## 3. Update your service call component TypeScript:

```typescript
// Add to your component
import { CloudinaryImage } from '../shared/components/cloudinary-image-manager.component';

export class AddServiceCallComponent {
  serviceCallImages: CloudinaryImage[] = [];

  // Handle image changes
  onImagesChanged(images: CloudinaryImage[]) {
    this.serviceCallImages = images;
    console.log('Images updated:', images.map(img => img.publicId));
  }

  // When saving service call
  onSubmit() {
    const requestModel = this.serviceCallForm.value;
    
    // Add image public IDs to the request
    requestModel.imagePublicIds = this.serviceCallImages.map(img => img.publicId);
    
    // Save as usual
    this.servicecallservice.updateServiceCall(requestModel).subscribe(response => {
      // Handle response
    });
  }

  // When loading existing service call
  loadExistingImages(publicIds: string[]) {
    // Use ViewChild to access the image manager component
    this.imageManagerComponent.loadImages(publicIds);
  }
}
```

## 4. Update your backend DTO:

```csharp
public class UpdateServiceCallDTO
{
    // ... existing properties ...
    public List<string>? ImagePublicIds { get; set; } // Store Cloudinary public IDs
}
```

## 5. Update database schema:

Instead of storing file paths, store Cloudinary public IDs:
```sql
ALTER TABLE ServiceCalls 
ADD ImagePublicIds NVARCHAR(MAX) -- Store comma-separated public IDs
```

## 6. Benefits:

✅ **Immediate deletion**: Images deleted instantly when × clicked
✅ **No server storage**: All images on Cloudinary CDN
✅ **Automatic optimization**: Images auto-compressed and resized
✅ **Global delivery**: Fast loading worldwide
✅ **Simple database**: Just store public IDs, no file paths
✅ **Easy backup**: Built-in redundancy and version history

## 7. Test the integration:

1. Upload an image - should appear immediately
2. Click × to delete - should disappear immediately
3. No need to save the service call for image operations
4. Images persist across page refreshes
5. Optimized loading and display

This completely eliminates all the complex image deletion logic we were struggling with!
