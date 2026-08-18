/**
 * Media compression & URL parsing utilities for Green Bussan Village Portal
 */

export async function compressImageFile(
  file: File,
  maxWidth = 960,
  maxHeightOrQuality?: number,
  explicitQuality = 0.72
): Promise<string> {
  let maxHeight = maxWidth;
  let quality = explicitQuality;

  if (typeof maxHeightOrQuality === 'number') {
    if (maxHeightOrQuality <= 1.0) {
      // User passed quality as 3rd parameter e.g. compressImage(file, 800, 0.8)
      quality = maxHeightOrQuality;
      maxHeight = maxWidth;
    } else {
      maxHeight = maxHeightOrQuality;
    }
  }

  return new Promise((resolve, reject) => {
    // If SVG or gif, convert directly to dataURL to preserve vector/animation
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);

    img.onload = () => {
      try {
        let width = img.width || 800;
        let height = img.height || 600;

        // Maintain aspect ratio while scaling within max bounding box
        if (width > height) {
          if (width > maxWidth) {
            height = Math.max(1, Math.round((height * maxWidth) / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.max(1, Math.round((width * maxHeight) / height));
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(img.src);
          return;
        }

        // High quality smooth resizing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Pass 1: standard compression
        let outputDataUrl = canvas.toDataURL('image/jpeg', Math.min(0.9, Math.max(0.4, quality)));

        // Pass 2: If size is still > 90 KB, perform secondary downsizing to ensure fast cloud sync
        const estimatedKb = (outputDataUrl.length * 3) / 4 / 1024;
        if (estimatedKb > 90 && width > 400) {
          const secondCanvas = document.createElement('canvas');
          const secondWidth = Math.max(1, Math.round(width * 0.75));
          const secondHeight = Math.max(1, Math.round(height * 0.75));
          secondCanvas.width = secondWidth;
          secondCanvas.height = secondHeight;

          const secondCtx = secondCanvas.getContext('2d');
          if (secondCtx) {
            secondCtx.imageSmoothingEnabled = true;
            secondCtx.imageSmoothingQuality = 'high';
            secondCtx.drawImage(canvas, 0, 0, secondWidth, secondHeight);
            outputDataUrl = secondCanvas.toDataURL('image/jpeg', 0.62);
          }
        }

        resolve(outputDataUrl);
      } catch (err) {
        console.warn('Compression error, falling back to original data URL:', err);
        resolve(img.src);
      }
    };

    img.onerror = () => {
      reject(new Error('Gagal memuat gambar untuk kompresi.'));
    };

    reader.readAsDataURL(file);
  });
}

export const compressImage = compressImageFile;

/**
 * Extracts YouTube video ID and returns standard iframe embed URL
 */
export function extractYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pattern for youtu.be/ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,12})/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  // Pattern for youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,12})/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // Pattern for youtube.com/shorts/ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,12})/);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // Pattern for youtube.com/embed/ID
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,12})/);
  if (embedMatch && embedMatch[1]) {
    return `https://www.youtube.com/embed/${embedMatch[1]}`;
  }

  return null;
}

/**
 * Creates clean WhatsApp chat link with pre-filled message
 */
export function createWhatsAppLink(phone?: string | null, text: string = ''): string {
  if (!phone) return '#';
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
