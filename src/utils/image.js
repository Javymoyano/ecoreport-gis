/**
 * Compresses an image file natively using HTML5 Canvas.
 * Useful for mobile uploads to avoid network timeouts and reduce disk space usage.
 * 
 * @param {File} file The original image File object from input.
 * @param {number} maxWidth The maximum width of the output image.
 * @param {number} maxHeight The maximum height of the output image.
 * @param {number} quality Compression quality from 0.0 to 1.0.
 * @returns {Promise<File>} A Promise that resolves to the compressed File object.
 */
export const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        // If file is not an image, resolve with the original file
        if (!file || !file.type || !file.type.startsWith('image/')) {
            return resolve(file);
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name || 'photo.jpg', {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file); // Fallback to original file on error
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (err) => {
                console.error("Image load error during compression", err);
                resolve(file); // Fallback to original file
            };
        };
        reader.onerror = (err) => {
            console.error("FileReader error during compression", err);
            resolve(file); // Fallback to original file
        };
    });
};
