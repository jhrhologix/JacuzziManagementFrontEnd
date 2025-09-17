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
      const customFilename = `${serviceCallNumber}_${username}_${dateStr}_${timestamp}`;
      
      // Set the custom filename as public_id (this will be combined with the folder)
      formData.append('public_id', customFilename);
      
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
   * Delete image from Cloudinary via backend API (avoids CORS and authentication issues)
   */
  deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(`🗑️ Deleting image: ${publicId}`);
      
      fetch(`${environment.apiUrl}/api/Cloudinary/DeleteImage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ publicId: publicId })
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Delete failed: ${response.status}`);
        }
      })
      .then(data => {
        console.log(`✅ Image deleted successfully: ${publicId}`);
        resolve(data);
      })
      .catch(error => {
        console.error(`❌ Delete failed: ${error.message}`);
        reject(error);
      });
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
   * Get all images for a service call via backend API
   * Backend will proxy the call to Cloudinary Admin API to avoid CORS
   */
  async getImagesForServiceCall(serviceCallNumber: string): Promise<ImageUploadResult[]> {
    try {
      console.log(`🔍 Fetching images for ${serviceCallNumber} via backend API`);
      
      // Call your backend API that will proxy to Cloudinary
      const response = await fetch(`${environment.apiUrl}/api/Cloudinary/GetImages?serviceCallNumber=${serviceCallNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Found ${data.length || 0} images for ${serviceCallNumber} via backend`);
        
        if (data && data.length > 0) {
          return data.map((resource: any) => ({
            publicId: resource.publicId || resource.public_id,
            url: resource.url || resource.secure_url,
            thumbnailUrl: this.getThumbnailUrl(resource.publicId || resource.public_id),
            uploadedBy: this.extractUploadedByFromPublicId(resource.publicId || resource.public_id)
          }));
        }
      } else {
        console.warn(`Backend API failed to fetch images for ${serviceCallNumber}:`, response.status);
      }
    } catch (error) {
      console.error('Error fetching images via backend:', error);
    }
    
    // Return empty array if no images found or error occurred
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
    console.log(`🔍 Checking delete permission:`);
    console.log(`   - Public ID: ${publicId}`);
    console.log(`   - Current username: ${currentUsername}`);
    console.log(`   - Is admin: ${isAdmin}`);
    
    if (isAdmin) {
      console.log(`✅ Admin can delete all images`);
      return true; // Admin can delete all images
    }
    
    // Handle different folder structures:
    // 1. service-calls/service-calls/SS042048/SS042048_username_date_timestamp
    // 2. service-calls/SS042048_username_date_timestamp
    
    const parts = publicId.split('/');
    console.log(`📂 Public ID parts: [${parts.join(', ')}]`);
    console.log(`📂 Parts length: ${parts.length}`);
    
    let filename = '';
    
    if (parts.length >= 3) {
      // Double folder structure: service-calls/service-calls/SS042048/filename
      filename = parts[parts.length - 1]; // Get the last part (filename)
      console.log(`📁 Using last part as filename (parts.length >= 3): ${filename}`);
    } else if (parts.length === 2) {
      // Single folder structure: service-calls/filename
      filename = parts[1];
      console.log(`📁 Using second part as filename (parts.length === 2): ${filename}`);
    } else {
      // Root level: just filename
      filename = publicId;
      console.log(`📁 Using entire publicId as filename (root level): ${filename}`);
    }
    
    console.log(`📁 Final extracted filename: ${filename}`);
    
    // Extract username from filename: SS042048_username_date_timestamp
    const filenameParts = filename.split('_');
    console.log(`🔧 Filename parts: [${filenameParts.join(', ')}]`);
    console.log(`🔧 Filename parts length: ${filenameParts.length}`);
    
    if (filenameParts.length >= 2) {
      const uploaderUsername = filenameParts[1]; // username part
      console.log(`👤 Extracted uploader username: '${uploaderUsername}'`);
      console.log(`👤 Current username: '${currentUsername}'`);
      console.log(`🔍 Username comparison: '${uploaderUsername}' === '${currentUsername}' = ${uploaderUsername === currentUsername}`);
      
      const canDelete = uploaderUsername === currentUsername;
      console.log(`${canDelete ? '✅' : '❌'} Final permission result: ${canDelete}`);
      return canDelete;
    }
    
    console.log(`❌ Cannot determine ownership from filename: ${filename}`);
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
