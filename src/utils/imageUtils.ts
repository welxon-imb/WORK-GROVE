/**
 * Utility functions for image processing and compression
 * Ensures uploaded photos (Face & Birth Certificate) are compressed
 * so they load quickly and fit comfortably in Firestore.
 */

export const compressImageFile = (
  file: File, 
  maxWidth = 800, 
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      // If it's a PDF or non-image, read as data url directly
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve((readerEvent.target?.result as string) || '');
          }
        } catch (err) {
          resolve((readerEvent.target?.result as string) || '');
        }
      };
      img.onerror = () => {
        resolve((readerEvent.target?.result as string) || '');
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};
