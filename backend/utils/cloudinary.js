import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'do6dt1ot2',
  api_key: process.env.CLOUDINARY_API_KEY || '959856998471536',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'e0JwQpDr3fvZcmEfcqqm4zLhoD0'
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @param {string} foldername - Folder name in Cloudinary
 * @returns {Promise<object>} - Cloudinary upload response
 */
export const cloudUpload = async (filePath, foldername) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    // Upload with specific options to handle timestamp issues
    const data = await cloudinary.uploader.upload(filePath, {
      folder: foldername,
      use_filename: true,
      unique_filename: true,
      overwrite: true,
      resource_type: 'auto',
      timeout: 60000 // 60 seconds timeout
    });

    // Clean up the local file after successful upload
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.log('Warning: Could not delete local file:', unlinkError.message);
    }

    return data;
  } catch (error) {
    // Enhanced error logging
    console.error('Cloudinary Upload Error:', {
      message: error.message,
      code: error.http_code,
      name: error.name,
      filePath,
      folder: foldername
    });

    // Rethrow with more context
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @returns {Promise<void>}
 */
export const cloudDelete = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (error) {
    console.error('Cloudinary Delete Error:', {
      message: error.message,
      code: error.http_code,
      name: error.name,
      publicId
    });
    throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
export const findCloudinaryPublicId = (url) => {
  if (!url) return null;

  try {
    const data = url.split('/');
    const parentFolder = data[url.split('/').length - 3];
    const subFolder = data[url.split('/').length - 2];
    const publicId = data[url.split('/').length - 1].split('.')[0];
    return `${parentFolder}/${subFolder}/${publicId}`;
  } catch (error) {
    console.error('Error extracting Cloudinary public ID:', error.message);
    return null;
  }
};
