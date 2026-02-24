import cloudinary from '../config/cloudinary.js';

// Legacy function - kept for backward compatibility
export const uploadImage = async (base64String, folder = 'signatures') => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: 'image',
    });
    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message || 'Failed to upload image to Cloudinary');
  }
};

// New function for file uploads (PDFs, documents, etc.)
export const uploadFile = async (base64String, folder = 'submissions', fileName = null) => {
  try {
    console.log('[Cloudinary Service] Attempting to upload file to Cloudinary, folder:', folder);
    console.log('[Cloudinary Service] Base64 string length:', base64String ? base64String.length : 0);
    
    // Verify Cloudinary configuration is loaded
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('Cloudinary configuration is missing. Please check environment variables.');
    }
    
    // Determine resource type based on filename
    let resourceType = 'auto';
    if (fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      // Explicitly set resource type for better control
      if (['pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
        resourceType = 'raw'; // For documents
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'].includes(ext)) {
        resourceType = 'image'; // For images
      }
    }
    
    console.log('[Cloudinary Service] Cloudinary config loaded, proceeding with upload');
    console.log('[Cloudinary Service] Using resource_type:', resourceType, 'for file:', fileName || 'unknown');
    
    const uploadResponse = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: resourceType,
    });
    
    console.log('[Cloudinary Service] Upload response received:', {
      public_id: uploadResponse.public_id,
      secure_url: uploadResponse.secure_url,
      resource_type: uploadResponse.resource_type
    });
    
    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      resourceType: uploadResponse.resource_type, // 'image' or 'raw'
    };
  } catch (error) {
    console.error('Cloudinary file upload error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.error?.http_code || error.code,
      details: error.error
    });
    throw new Error(error.message || 'Failed to upload file to Cloudinary');
  }
};

export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};