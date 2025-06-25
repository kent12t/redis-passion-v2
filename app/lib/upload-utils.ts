/**
 * Converts a blob to a File object
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now(),
  });
}

/**
 * Uploads an image blob to the API endpoint
 */
export async function uploadImage(
  blob: Blob,
  personalityType: string,
  fileName?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    
    // Convert blob to file
    const file = blobToFile(blob, fileName || `${personalityType}-result.png`);
    formData.append('image', file);
    formData.append('personalityType', personalityType);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Upload failed',
      };
    }

    return {
      success: true,
      url: result.url,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Converts canvas to blob
 */
export function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      'image/png',
      quality
    );
  });
}

/**
 * Downloads blob as file
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 