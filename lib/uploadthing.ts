import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Generate typed components based on our file router
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// Generate typed react helpers (hooks) - V7 compatible
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();