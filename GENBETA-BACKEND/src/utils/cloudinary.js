import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (fileBuffer, folder = 'logos', fileName = null) => {
  return new Promise((resolve, reject) => {
    // Determine resource type based on file content if filename provided
    let resourceType = 'auto';
    if (fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      // Explicitly set to 'raw' for documents to ensure correct handling
      if (['pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
        resourceType = 'raw';
      }
    }
    
    const options = {
      folder: folder,
      resource_type: resourceType,
    };
    
    // Debug log to see what's being used
    console.log(`[Cloudinary Upload] Filename: ${fileName || 'unknown'}, Detected ext: ${fileName?.split('.').pop()?.toLowerCase() || 'none'}, Resource type: ${resourceType}`);
    
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload] Error:', error);
          return reject(error);
        }
        console.log(`[Cloudinary Upload] Success - URL: ${result.secure_url}, Resource type: ${result.resource_type}`);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
