"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TbChevronLeft, TbChevronRight, TbZoomIn } from "react-icons/tb";
import OptimizedImage from "./OptimizedImage";

interface ImageCarouselProps {
  images: string[];
  title: string;
  onImageClick?: (index: number) => void;
}

export default function ImageCarousel({ 
  images, 
  title,
  onImageClick 
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handlePrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleDotClick = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
  }, [handlePrevious, handleNext]);

  // Add keyboard listener
  useState(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const diffX = touchEnd.x - touchStart.x;
    const diffY = touchEnd.y - touchStart.y;
    
    // Check if it's a horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
    
    setTouchStart(null);
  }, [touchStart, handlePrevious, handleNext]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[60vh] overflow-hidden rounded-xl relative bg-neutral-100 flex items-center justify-center">
        <span className="text-neutral-500">No images available</span>
      </div>
    );
  }

  // Single image - no carousel needed
  if (images.length === 1) {
    return (
      <div className="w-full h-[60vh] overflow-hidden rounded-xl relative group">
        <OptimizedImage
          src={images[0]}
          fill
          className="object-cover"
          alt={title}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {onImageClick && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onImageClick(0);
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors cursor-zoom-in"
          >
            <TbZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={40} />
          </button>
        )}
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div 
      className="w-full h-[60vh] overflow-hidden rounded-xl relative group"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0"
        >
          <OptimizedImage
            src={images[currentIndex]}
            fill
            className="object-cover"
            alt={`${title} - Image ${currentIndex + 1}`}
            priority={currentIndex === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {onImageClick && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onImageClick(currentIndex);
              }}
              className="absolute inset-0 bg-transparent cursor-zoom-in"
              aria-label="View full size image"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handlePrevious();
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-neutral-800 opacity-0 group-hover:opacity-100 transition hover:bg-white"
        aria-label="Previous image"
      >
        <TbChevronLeft size={24} />
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNext();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-neutral-800 opacity-0 group-hover:opacity-100 transition hover:bg-white"
        aria-label="Next image"
      >
        <TbChevronRight size={24} />
      </button>

      {/* Zoom button */}
      {onImageClick && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onImageClick(currentIndex);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 text-neutral-800 opacity-0 group-hover:opacity-100 transition hover:bg-white"
          aria-label="View full size"
        >
          <TbZoomIn size={24} />
        </button>
      )}

      {/* Image counter */}
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`
              w-2 h-2 rounded-full transition-all
              ${index === currentIndex 
                ? "bg-white w-8" 
                : "bg-white/50 hover:bg-white/80"
              }
            `}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Mobile swipe hint */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 text-white text-xs bg-black/40 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 md:hidden transition-opacity">
        Swipe to navigate
      </div>
    </div>
  );
}