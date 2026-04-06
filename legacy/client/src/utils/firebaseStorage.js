/**
 * Cloudinary Upload Utility (replaces Firebase Storage — 100% FREE)
 * 
 * Setup (2 min):
 * 1. Go to https://cloudinary.com/users/register_free → sign up free
 * 2. Dashboard → copy your "Cloud Name"
 * 3. Settings → Upload → Upload presets → Add preset:
 *    - Name: ar_food_uploads
 *    - Signing Mode: Unsigned
 *    - Save
 * 4. Replace YOUR_CLOUD_NAME below with your real cloud name
 */

const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME'; // ← REPLACE THIS
const CLOUDINARY_UPLOAD_PRESET = 'ar_food_uploads';

/**
 * Uploads a file to Cloudinary and returns the public download URL
 * @param {File} file - The file object from an input type="file"
 * @param {string} path - Used as a folder prefix (e.g. 'models' or 'images')
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 */
export const uploadFileToStorage = async (file, path, onProgress = null) => {
    // Extract folder from path (e.g. 'images/timestamp_file.jpg' → folder='images')
    const folder = path.split('/')[0];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `ar_food/${folder}`);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(percent);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                resolve(response.secure_url);
            } else {
                reject(new Error(`Cloudinary upload failed: ${xhr.statusText}`));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`);
        xhr.send(formData);
    });
};
