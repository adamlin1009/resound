import { getPlaiceholder } from "plaiceholder";

export interface BlurDataURL {
  base64: string;
  width: number;
  height: number;
}

/**
 * Generate a blur placeholder for an image URL
 * This is called server-side during build or request time
 */
export async function getBlurDataURL(src: string): Promise<BlurDataURL | null> {
  try {
    // For Uploadthing URLs (V6 and V7), we can fetch the image
    if (src.includes('uploadthing') || src.includes('utfs.io') || src.includes('.ufs.sh')) {
      const response = await fetch(src);
      const buffer = Buffer.from(await response.arrayBuffer());
      
      const { base64, metadata } = await getPlaiceholder(buffer);
      
      return {
        base64,
        width: metadata.width,
        height: metadata.height
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error generating blur placeholder:', error);
    return null;
  }
}

/**
 * Generate blur data for multiple images
 */
export async function getBlurDataForImages(images: string[]): Promise<(BlurDataURL | null)[]> {
  return Promise.all(images.map(getBlurDataURL));
}

/**
 * Client-side lazy loading configuration
 */
export const lazyLoadConfig = {
  // Intersection Observer options
  rootMargin: '50px 0px',
  threshold: 0.01,
};

/**
 * Hook for lazy loading images
 */
export function useLazyLoad() {
  if (typeof window === 'undefined') return { supported: false };
  
  return {
    supported: 'IntersectionObserver' in window,
    loading: 'lazy' as const,
  };
}