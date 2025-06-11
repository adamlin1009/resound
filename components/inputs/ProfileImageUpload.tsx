"use client";

import { useCallback, useState } from "react";
import { TbPhotoPlus, TbX } from "react-icons/tb";
import Image from "next/image";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "react-toastify";
import Loader from "../Loader";

interface ProfileImageUploadProps {
  onChange: (value: string) => void;
  value: string;
}

export default function ProfileImageUpload({ 
  onChange, 
  value 
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { startUpload } = useUploadThing("profileImage");

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    
    try {
      const uploadedFiles = await startUpload([file]);
      
      if (uploadedFiles && uploadedFiles.length > 0) {
        onChange(uploadedFiles[0].url);
        toast.success("Profile image uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [onChange, startUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      // Validate file size (2MB max for profile images)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be less than 2MB");
        return;
      }
      
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleRemove = useCallback(() => {
    onChange("");
  }, [onChange]);

  return (
    <div className="relative">
      <input
        type="file"
        id="profile-image-upload"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
      />
      
      <label
        htmlFor="profile-image-upload"
        className={`
          relative cursor-pointer hover:opacity-70 transition
          border-dashed border-2 p-20 border-neutral-300
          flex flex-col justify-center items-center gap-4
          text-neutral-600 rounded-lg
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader />
            <p className="text-neutral-600">Uploading...</p>
          </div>
        ) : (
          <>
            <TbPhotoPlus size={50} />
            <div className="font-semibold text-lg">Click to upload</div>
            <p className="text-sm text-neutral-500">
              JPG, PNG, WEBP (max 2MB)
            </p>
          </>
        )}
        
        {value && !isUploading && (
          <div className="absolute inset-0 w-full h-full">
            <Image
              alt="Profile"
              fill
              style={{ objectFit: "cover" }}
              src={value}
              className="rounded-lg"
            />
            
            {/* Remove button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleRemove();
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
              type="button"
            >
              <TbX size={20} />
            </button>
          </div>
        )}
      </label>
    </div>
  );
}