"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { TbPhotoPlus, TbX, TbGripVertical } from "react-icons/tb";
import Image from "next/image";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "react-toastify";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Loader from "../Loader";

interface ImageUploadProps {
  onChange: (value: string[]) => void;
  value: string[];
  maxImages?: number;
}

// Sortable image item component
function SortableImage({ 
  url, 
  index, 
  onRemove 
}: { 
  url: string; 
  index: number; 
  onRemove: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square"
    >
      <Image
        src={url}
        alt={`Image ${index + 1}`}
        fill
        className="object-cover rounded-lg"
      />
      
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1 bg-white/80 rounded cursor-move hover:bg-white transition"
      >
        <TbGripVertical size={20} />
      </div>
      
      {/* Remove button */}
      <button
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
        type="button"
      >
        <TbX size={20} />
      </button>
      
      {/* Image number badge */}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>
    </div>
  );
}

export default function ImageUpload({ 
  onChange, 
  value = [], 
  maxImages = 10 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { startUpload } = useUploadThing("listingImages");
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle file upload
  const handleUpload = useCallback(async (files: File[]) => {
    if (value.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadedFiles = await startUpload(files);
      
      if (uploadedFiles && uploadedFiles.length > 0) {
        const newUrls = uploadedFiles.map(file => file.url);
        onChange([...value, ...newUrls]);
        toast.success(`${uploadedFiles.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [value, onChange, maxImages, startUpload]);

  // Handle drag end for reordering
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = value.indexOf(active.id);
      const newIndex = value.indexOf(over.id);
      
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  // Handle image removal
  const handleRemove = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleUpload(acceptedFiles);
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxImages - value.length,
    disabled: isUploading || value.length >= maxImages,
  });

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer hover:opacity-70 transition
          border-2 border-dashed p-8 rounded-lg
          flex flex-col justify-center items-center gap-4
          ${isDragActive ? 'border-amber-500 bg-amber-50' : 'border-neutral-300'}
          ${value.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader />
            <p className="text-neutral-600">Uploading...</p>
          </div>
        ) : (
          <>
            <TbPhotoPlus size={50} className="text-neutral-600" />
            <div className="text-center">
              <p className="font-semibold text-lg">
                {isDragActive ? "Drop the images here" : "Click or drag images to upload"}
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                {value.length >= maxImages 
                  ? `Maximum ${maxImages} images reached`
                  : `Upload up to ${maxImages - value.length} more image(s)`
                }
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                JPG, JPEG, PNG, WEBP (max 4MB each)
              </p>
            </div>
          </>
        )}
      </div>

      {/* Image preview grid */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">
              Uploaded Images ({value.length}/{maxImages})
            </h3>
            {value.length > 1 && (
              <p className="text-sm text-neutral-500">
                Drag to reorder
              </p>
            )}
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={value}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {value.map((url, index) => (
                  <SortableImage
                    key={url}
                    url={url}
                    index={index}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}