import { Injectable } from '@angular/core';
import { Cloudinary } from 'cloudinary-core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private cloudinary: Cloudinary;

  constructor(private http: HttpClient) {
    this.cloudinary = new Cloudinary({
      cloud_name: environment.cloudinary.cloudName,
      secure: true
    });
  }

  /**
   * Upload image to Cloudinary
   * @param file - The image file to upload
   * @param folder - Optional folder to organize images (e.g., 'service-calls')
   * @returns Promise with upload result
   */
  uploadImage(file: File, folder?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', environment.cloudinary.uploadPreset);
      
      if (folder) {
        formData.append('folder', folder);
      }

      // Add context for better organization
      formData.append('context', `service_call=true|uploaded_at=${new Date().toISOString()}`);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;

      fetch(uploadUrl, {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve({
            publicId: data.public_id,
            url: data.secure_url,
            width: data.width,
            height: data.height
          });
        }
      })
      .catch(error => reject(error));
    });
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - The public ID of the image to delete
   * @returns Promise with deletion result
   */
  deleteImage(publicId: string): Promise<any> {
    // Note: For security reasons, image deletion should typically be done from backend
    // This is a client-side approach using the destroy endpoint
    return new Promise((resolve, reject) => {
      const deleteUrl = `https://api.cloudinary.com/v1_1/your-cloud-name/image/destroy`; // Replace with your cloud name
      
      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('api_key', 'your-api-key'); // Replace with your API key
      formData.append('timestamp', Math.round(new Date().getTime() / 1000).toString());
      
      // Note: You'll need to generate a signature for secure deletion
      // For production, implement deletion on your backend instead
      
      fetch(deleteUrl, {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => resolve(data))
      .catch(error => reject(error));
    });
  }

  /**
   * Generate optimized image URL
   * @param publicId - The public ID of the image
   * @param transformations - Optional transformations (width, height, quality, etc.)
   * @returns Optimized image URL
   */
  getOptimizedImageUrl(publicId: string, transformations?: any): string {
    const defaultTransformations = {
      quality: 'auto',
      fetch_format: 'auto',
      ...transformations
    };

    return this.cloudinary.url(publicId, defaultTransformations);
  }

  /**
   * Generate thumbnail URL
   * @param publicId - The public ID of the image
   * @param width - Thumbnail width (default: 150)
   * @param height - Thumbnail height (default: 150)
   * @returns Thumbnail URL
   */
  getThumbnailUrl(publicId: string, width: number = 150, height: number = 150): string {
    return this.cloudinary.url(publicId, {
      width: width,
      height: height,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    });
  }
}
