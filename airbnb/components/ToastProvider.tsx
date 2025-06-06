"use client";

import React from "react";
import "react-toastify/dist/ReactToastify.css";

// Import everything to debug what's available
const toastify = require("react-toastify");

export default function ToastProvider() {
  console.log("react-toastify exports:", Object.keys(toastify));
  
  const ToastContainer = toastify.ToastContainer;
  
  if (!ToastContainer) {
    console.error("ToastContainer is not available from react-toastify");
    return null;
  }

  return (
    <ToastContainer
      position="bottom-left"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      pauseOnFocusLoss
      pauseOnHover
      theme="colored"
    />
  );
}