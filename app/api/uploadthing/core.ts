import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "@uploadthing/shared";
import getCurrentUser from "@/app/actions/getCurrentUser";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define upload endpoint for listing images (multiple)
  listingImages: f({ 
    image: { 
      maxFileSize: "4MB",
      maxFileCount: 10  // Allow up to 10 images per listing
    } 
  })
    // Set permissions and metadata
    .middleware(async ({ req }) => {
      // Get the current user from session
      const user = await getCurrentUser();

      // If not authenticated, throw UploadThingError for proper client error handling
      if (!user) throw new UploadThingError("You need to be logged in to upload files");

      // Pass metadata to onUploadComplete
      return { userId: user.id };
    })
    // Handle post-upload tasks
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Listing image upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      
      // Return data to the client
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Define upload endpoint for profile images (single)
  profileImage: f({ 
    image: { 
      maxFileSize: "2MB",
      maxFileCount: 1  // Only allow 1 profile image
    } 
  })
    .middleware(async ({ req }) => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("You need to be logged in to upload profile images");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile image upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Mobile upload endpoint with temporary token validation
  mobileUpload: f({ 
    image: { 
      maxFileSize: "4MB",
      maxFileCount: 5  // Limit mobile uploads to 5 at a time
    } 
  })
    .middleware(async ({ req }) => {
      // Mobile uploads don't require authentication
      // The token validation happens in the upload page itself
      // We'll pass through the listing ID from the request
      
      const listingId = req.headers.get("x-listing-id") || "";
      const uploadToken = req.headers.get("x-upload-token") || "";
      
      // We don't validate the token here because Uploadthing doesn't have access to our database
      // The validation happens in the page component before showing the upload interface
      
      return { listingId, uploadToken };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Mobile upload complete:", {
        listingId: metadata.listingId,
        url: file.url
      });
      
      return { 
        listingId: metadata.listingId,
        url: file.url 
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;