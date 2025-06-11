"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { TbX, TbChevronLeft, TbChevronRight, TbZoomIn, TbZoomOut, TbRefresh } from "react-icons/tb";
import OptimizedImage from "./OptimizedImage";

interface ImageGalleryModalProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  title?: string;
}

export default function ImageGalleryModal({
  images,
  initialIndex = 0,
  onClose,
  title = "Image"
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handlePrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    resetZoom();
  }, [images.length, resetZoom]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    resetZoom();
  }, [images.length, resetZoom]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      resetZoom();
    }
  }, [zoom, resetZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  }, [handleZoomIn, handleZoomOut]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setTouchStartTime(Date.now());
    }
  }, [zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart || zoom > 1) return;
    
    const touchEnd = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const diffX = touchEnd.x - touchStart.x;
    const diffY = touchEnd.y - touchStart.y;
    
    // If vertical movement is greater, let the default behavior happen (scroll)
    if (Math.abs(diffY) > Math.abs(diffX)) {
      setTouchStart(null);
      return;
    }
    
    // Prevent default only for horizontal swipes
    if (Math.abs(diffX) > 10) {
      e.preventDefault();
    }
  }, [touchStart, zoom]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart || zoom > 1) return;
    
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const diffX = touchEnd.x - touchStart.x;
    const diffY = touchEnd.y - touchStart.y;
    const diffTime = Date.now() - touchStartTime;
    
    // Check if it's a horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50 && diffTime < 500) {
      if (diffX > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
    
    setTouchStart(null);
  }, [touchStart, touchStartTime, zoom, handlePrevious, handleNext]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "+") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "r" || e.key === "R") resetZoom();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevious, handleNext, onClose, handleZoomIn, handleZoomOut, resetZoom]);

  // Handle wheel events for zoom
  useEffect(() => {
    const container = imageContainerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Top controls bar */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-50">
        {/* Image counter */}
        <div className="px-3 py-1 rounded-full bg-white/10 text-white text-sm backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            disabled={zoom <= 1}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom out"
          >
            <TbZoomOut size={20} />
          </button>
          
          <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm backdrop-blur-sm min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            disabled={zoom >= 3}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom in"
          >
            <TbZoomIn size={20} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetZoom();
            }}
            disabled={zoom === 1}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Reset zoom"
          >
            <TbRefresh size={20} />
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-sm"
          aria-label="Close gallery"
        >
          <TbX size={24} />
        </button>
      </div>

      {/* Main image container */}
      <div 
        ref={imageContainerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
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
            className="absolute"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              transformOrigin: 'center',
              maxWidth: '90vw',
              maxHeight: '90vh',
            }}
          >
            <OptimizedImage
              src={images[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain select-none pointer-events-none"
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
              priority
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Previous image"
          >
            <TbChevronLeft size={32} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Next image"
          >
            <TbChevronRight size={32} />
          </button>
        </>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`
                relative w-20 h-20 rounded overflow-hidden transition-all flex-shrink-0
                ${index === currentIndex 
                  ? "ring-2 ring-white opacity-100" 
                  : "opacity-50 hover:opacity-75"
                }
              `}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}