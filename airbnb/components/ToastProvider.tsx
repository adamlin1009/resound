"use client";

import dynamic from "next/dynamic";
import "react-toastify/dist/ReactToastify.css";

// Dynamically load our own wrapper that already configures ToastContainer.
// This avoids the "Element type is invalid" error that appears when we try
// to point next/dynamic directly at react-toastify's named export.
const ToastContainer = dynamic(() => import("./ToastContainerBar"), {
  ssr: false,
});

export default function ToastProvider() {
  return <ToastContainer />;
}