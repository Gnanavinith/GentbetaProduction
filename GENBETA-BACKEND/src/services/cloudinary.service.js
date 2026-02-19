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
export const uploadFile = async (base64String, folder = 'submissions') => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: 'auto', // This automatically detects file type
    });
    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      resourceType: uploadResponse.resource_type, // 'image' or 'raw'
    };
  } catch (error) {
    console.error('Cloudinary file upload error:', error);
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
