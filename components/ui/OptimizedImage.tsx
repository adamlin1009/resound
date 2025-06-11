"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  sizes?: string;
  blurDataURL?: string;
  onLoad?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  style,
  priority = false,
  sizes,
  blurDataURL,
  onLoad
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Early validation - treat empty strings or invalid URLs as errors
  if (!src || src.trim() === '') {
    return (
      <div className={cn("bg-gray-200 flex items-center justify-center", className)} style={style}>
        <span className="text-gray-500 text-sm">No image available</span>
      </div>
    );
  }

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    console.error('Image failed to load:', src);
    setHasError(true);
    setIsLoaded(true);
  };

  // Simplified approach - just use Next.js Image with loading states
  if (hasError) {
    return (
      <div className={cn("bg-gray-200 flex items-center justify-center", className)} style={style}>
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <>
      {/* Show skeleton while loading */}
      {!isLoaded && (
        <div 
          className={cn("absolute inset-0 bg-gray-200 animate-pulse", className)} 
          style={style}
        />
      )}
      
      {/* The actual image */}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        style={style}
        priority={priority}
        sizes={sizes || (fill ? "100vw" : undefined)}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? undefined : "lazy"}
        placeholder={blurDataURL ? "blur" : undefined}
        blurDataURL={blurDataURL}
      />
    </>
  );
}