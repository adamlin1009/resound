import {
  generateUploadButton,
  generateUploadDropzone,
  generateUploader,
  generateReactHelpers,
} from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Generate typed components based on our file router
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const Uploader = generateUploader<OurFileRouter>();

// Generate typed react helpers (hooks)
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();