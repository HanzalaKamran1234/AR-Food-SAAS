import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

let storage;

try {
    storage = getStorage();
} catch (err) {
    console.warn("Firebase Storage missing configuration. Uploads will run in mock mode.");
}

/**
 * Uploads a file to Firebase Storage and returns the public download URL
 * @param {File} file - The file object from an input type="file"
 * @param {string} path - The storage path (e.g., 'models/food1.glb' or 'images/thumb1.jpg')
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 */
export const uploadFileToStorage = async (file, path, onProgress = null) => {
    if (!storage) {
        // Mock mode for local testing without Firebase Keys
        console.warn(`[MOCK MODE] Simulating upload for ${file.name} to ${path}`);
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 25;
                if (onProgress) onProgress(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                    // Return a fake blob URL or dummy URL
                    resolve(`https://dummy-storage.com/${path}`);
                }
            }, 500);
        });
    }

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => reject(error),
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
};
