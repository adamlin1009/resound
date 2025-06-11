import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface UseListingImagesProps {
  listingId: string;
  initialImages: string[];
}

export const useListingImages = ({ listingId, initialImages }: UseListingImagesProps) => {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [isLoading, setIsLoading] = useState(false);

  // Update all images (replace entire array)
  const updateImages = useCallback(async (newImages: string[]) => {
    if (newImages.length > 10) {
      toast.error("Maximum 10 images allowed per listing");
      return false;
    }

    setIsLoading(true);
    try {
      const response = await axios.patch(`/api/listings/${listingId}`, {
        imageSrc: newImages,
      });
      
      setImages(response.data.imageSrc);
      toast.success("Images updated successfully");
      router.refresh();
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || "Failed to update images");
      } else {
        toast.error("Failed to update images");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [listingId, router]);

  // Reorder images
  const reorderImages = useCallback(async (reorderedImages: string[]) => {
    setIsLoading(true);
    try {
      const response = await axios.put(`/api/listings/${listingId}/images`, {
        imageSrc: reorderedImages,
      });
      
      setImages(response.data.imageSrc);
      toast.success("Images reordered successfully");
      router.refresh();
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || "Failed to reorder images");
      } else {
        toast.error("Failed to reorder images");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [listingId, router]);

  // Delete a specific image
  const deleteImage = useCallback(async (imageUrl: string) => {
    if (images.length === 1) {
      toast.error("Cannot delete the last image");
      return false;
    }

    setIsLoading(true);
    try {
      const response = await axios.delete(`/api/listings/${listingId}/images`, {
        data: { imageUrl },
      });
      
      setImages(response.data.imageSrc);
      toast.success("Image deleted successfully");
      router.refresh();
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || "Failed to delete image");
      } else {
        toast.error("Failed to delete image");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [listingId, images.length, router]);

  // Add new images to existing ones
  const addImages = useCallback(async (newImageUrls: string[]) => {
    const updatedImages = [...images, ...newImageUrls];
    
    if (updatedImages.length > 10) {
      const remainingSlots = 10 - images.length;
      toast.error(`Can only add ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'}. Maximum 10 images allowed.`);
      return false;
    }

    return updateImages(updatedImages);
  }, [images, updateImages]);

  return {
    images,
    isLoading,
    updateImages,
    reorderImages,
    deleteImage,
    addImages,
  };
};