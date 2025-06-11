"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "react-toastify";
import axios from "axios";
import Image from "next/image";
import { TbUpload, TbX, TbCheck, TbClock } from "react-icons/tb";
import Container from "@/components/Container";
import Heading from "@/components/Heading";
import Button from "@/components/Button";
import { useDropzone } from "react-dropzone";
import { format } from "date-fns";

interface MobileUploadClientProps {
  listing: {
    id: string;
    title: string;
    currentImages: string[];
    ownerName: string;
  };
  token: string;
  expiresAt: Date;
}

export default function MobileUploadClient({
  listing,
  token,
  expiresAt,
}: MobileUploadClientProps) {
  const router = useRouter();
  const { startUpload } = useUploadThing("mobileUpload");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  // Calculate remaining time
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const remainingSlots = 10 - listing.currentImages.length - uploadedImages.length;
      
      if (remainingSlots <= 0) {
        toast.error("This listing already has the maximum of 10 images");
        return;
      }

      const filesToUpload = acceptedFiles.slice(0, remainingSlots);
      
      if (filesToUpload.length < acceptedFiles.length) {
        toast.warning(`Only uploading ${filesToUpload.length} of ${acceptedFiles.length} images due to the 10 image limit`);
      }

      setIsUploading(true);

      try {
        const uploadResults = await startUpload(filesToUpload);
        
        if (uploadResults) {
          const newImageUrls = uploadResults.map((file) => file.url);
          setUploadedImages((prev) => [...prev, ...newImageUrls]);
          toast.success(`${uploadResults.length} image${uploadResults.length > 1 ? "s" : ""} uploaded successfully`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload images. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [listing.currentImages.length, uploadedImages.length, startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    disabled: isUploading,
  });

  const removeImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (uploadedImages.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsUploading(true);

    try {
      // Add the new images to the listing using token-based endpoint
      const updatedImageSrc = [...listing.currentImages, ...uploadedImages];
      
      await axios.patch(`/api/listings/${listing.id}/images`, {
        imageSrc: updatedImageSrc,
        token: token,
      });

      toast.success("Images added to listing successfully!");
      
      // Show success screen
      setUploadedImages([]);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Failed to update listing:", error);
      toast.error("Failed to save images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [uploadedImages, listing.currentImages, listing.id, router, token]);

  const totalImages = listing.currentImages.length + uploadedImages.length;
  const remainingSlots = 10 - totalImages;

  return (
    <Container>
      <div className="max-w-md mx-auto py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="mb-6">
            <Heading
              title="Upload Images"
              subtitle={`For ${listing.title}`}
            />
            <p className="text-sm text-gray-600 mt-2">
              Owned by {listing.ownerName}
            </p>
          </div>

          {/* Time Remaining */}
          <div className="mb-6 p-3 bg-amber-50 rounded-md flex items-center gap-2">
            <TbClock className="text-amber-600" size={20} />
            <span className="text-sm text-amber-800">
              Time remaining: <strong>{timeRemaining}</strong>
            </span>
          </div>

          {/* Image Count */}
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600">
              Current images: {listing.currentImages.length} / 10
            </p>
            {remainingSlots > 0 ? (
              <p className="text-sm text-green-600">
                You can upload {remainingSlots} more image{remainingSlots > 1 ? "s" : ""}
              </p>
            ) : (
              <p className="text-sm text-red-600">
                Maximum image limit reached
              </p>
            )}
          </div>

          {/* Upload Area */}
          {remainingSlots > 0 && (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-200
                ${
                  isDragActive
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-300 hover:border-gray-400"
                }
                ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <input {...getInputProps()} />
              <TbUpload className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 mb-2">
                {isDragActive
                  ? "Drop your images here"
                  : "Tap to select images or drag them here"}
              </p>
              <p className="text-sm text-gray-500">
                JPG, PNG, WEBP (max 4MB each)
              </p>
            </div>
          )}

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">
                Uploaded Images ({uploadedImages.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`Upload ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                    >
                      <TbX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {uploadedImages.length > 0 && (
            <div className="mt-6">
              <Button
                label={isUploading ? "Saving..." : "Add Images to Listing"}
                onClick={handleSubmit}
                disabled={isUploading}
                icon={TbCheck}
              />
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-semibold mb-2">Instructions:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Upload up to {remainingSlots} more images</li>
              <li>• Each image must be under 4MB</li>
              <li>• Supported formats: JPG, PNG, WEBP</li>
              <li>• Images will be added to the listing immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
}