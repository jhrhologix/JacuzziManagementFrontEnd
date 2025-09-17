import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface ImageUploadResult {
  publicId: string;
  url: string;
  thumbnailUrl: string;
  uploadedBy?: 'admin' | 'technician';
}

@Injectable({
  providedIn: 'root'
})
export class ImageApiService {
  private cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;
  private cloudinaryDeleteUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/destroy`;

  constructor(private http: HttpClient) {}

  /**
   * Upload image to Cloudinary with naming convention: servicecall_username_date_increment
   */
  uploadImage(file: File, serviceCallNumber: string, username: string, uploadedBy: 'admin' | 'technician' = 'admin'): Promise<ImageUploadResult> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', environment.cloudinary.uploadPreset);
      formData.append('folder', `service-calls/${serviceCallNumber}`);
      
      // Create unique filename: servicecall_username_date_timestamp
      const timestamp = Date.now();
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const publicIdSuffix = `${serviceCallNumber}_${username}_${dateStr}_${timestamp}`;
      // Don't set public_id manually - let Cloudinary auto-generate to avoid double folder
      
      formData.append('context', `service_call=${serviceCallNumber}|uploaded_by=${uploadedBy}|username=${username}`);
      formData.append('tags', `service_call,${serviceCallNumber},${uploadedBy},${username}`);

      fetch(this.cloudinaryUploadUrl, {
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
            thumbnailUrl: this.getThumbnailUrl(data.public_id),
            uploadedBy: uploadedBy
          });
        }
      })
      .catch(error => reject(error));
    });
  }

  /**
   * Delete image from Cloudinary
   */
  deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('upload_preset', environment.cloudinary.uploadPreset);

      fetch(this.cloudinaryDeleteUrl, {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => resolve(data))
      .catch(error => reject(error));
    });
  }

  /**
   * Get optimized image URL
   */
  getOptimizedUrl(publicId: string, width?: number, height?: number): string {
    const baseUrl = `https://res.cloudinary.com/${environment.cloudinary.cloudName}/image/upload`;
    let transformations = 'q_auto,f_auto';
    
    if (width && height) {
      transformations += `,w_${width},h_${height},c_fill`;
    } else if (width) {
      transformations += `,w_${width}`;
    }
    
    return `${baseUrl}/${transformations}/${publicId}`;
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(publicId: string, size: number = 200): string {
    return this.getOptimizedUrl(publicId, size, size);
  }

  /**
   * Get full size URL
   */
  getFullSizeUrl(publicId: string): string {
    return `https://res.cloudinary.com/${environment.cloudinary.cloudName}/image/upload/q_auto,f_auto/${publicId}`;
  }

  /**
   * Get all images for a service call using Cloudinary Admin API with Basic Auth
   */
  async getImagesForServiceCall(serviceCallNumber: string): Promise<ImageUploadResult[]> {
    try {
      console.log(`🔍 Searching for images for service call: ${serviceCallNumber}`);
      
      // Use Basic HTTP Authentication (this works!)
      const credentials = btoa(`${environment.cloudinary.apiKey}:${environment.cloudinary.apiSecret}`);
      
      // Search for images with the service call number in the public_id
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/resources/image?max_results=100&prefix=service-calls/${serviceCallNumber}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Found ${data.resources?.length || 0} existing images for ${serviceCallNumber}`);
        
        if (data.resources && data.resources.length > 0) {
          return data.resources.map((resource: any) => ({
            publicId: resource.public_id,
            url: resource.secure_url,
            thumbnailUrl: this.getThumbnailUrl(resource.public_id),
            uploadedBy: this.extractUploadedByFromPublicId(resource.public_id)
          }));
        }
      } else {
        console.warn(`Failed to fetch images for ${serviceCallNumber}:`, response.status);
        const errorText = await response.text();
        console.warn('Error details:', errorText);
      }
    } catch (error) {
      console.error('Error fetching images from Cloudinary:', error);
    }
    
    return [];
  }

  /**
   * Generate signature for Cloudinary Admin API
   */
  private async generateSignature(stringToSign: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(stringToSign);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Error generating signature:', error);
      return '';
    }
  }

  /**
   * Check if an image exists in Cloudinary by trying to access it
   */
  private async checkImageExists(publicId: string): Promise<boolean> {
    try {
      const imageUrl = this.getThumbnailUrl(publicId, 50); // Small thumbnail for quick check
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Storage methods removed - using Cloudinary search only

  /**
   * Extract who uploaded the image from the public ID naming convention
   */
  private extractUploadedByFromPublicId(publicId: string): 'admin' | 'technician' {
    // Extract from public ID like: service-calls/SS042048/SS042048_FrancoisM_20250917_1758074139280
    const parts = publicId.split('/');
    if (parts.length >= 3) {
      const filename = parts[2];
      const filenameParts = filename.split('_');
      if (filenameParts.length >= 2) {
        const username = filenameParts[1];
        // You can determine admin vs technician based on username or add this to the naming convention
        return 'technician'; // For now, assume non-admin users are technicians
      }
    }
    return 'admin'; // Default
  }

  /**
   * Check if user can delete an image based on naming convention
   */
  canDeleteImage(publicId: string, currentUsername: string, isAdmin: boolean): boolean {
    if (isAdmin) {
      return true; // Admin can delete all images
    }
    
    // Extract username from public ID: service-calls/SC123/SC123_john_20250917_1234567890
    const parts = publicId.split('/');
    if (parts.length >= 3) {
      const filename = parts[2]; // SC123_john_20250917_1234567890
      const filenameParts = filename.split('_');
      if (filenameParts.length >= 2) {
        const uploaderUsername = filenameParts[1]; // john
        return uploaderUsername === currentUsername; // User can only delete their own images
      }
    }
    
    return false; // Can't determine ownership, deny deletion
  }

  /**
   * Delete all images for a service call (admin only)
   */
  async deleteAllImagesForServiceCall(serviceCallNumber: string): Promise<void> {
    try {
      const images = await this.getImagesForServiceCall(serviceCallNumber);
      const deletePromises = images.map(image => this.deleteImage(image.publicId));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting all images:', error);
      throw error;
    }
  }
}
