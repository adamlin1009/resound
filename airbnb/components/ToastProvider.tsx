"use client";

import React, { useEffect, useState } from "react";

function ToastProvider() {
  const [ToastContainer, setToastContainer] = useState<any>(null);

  useEffect(() => {
    // Dynamically import react-toastify to avoid SSR issues
    import("react-toastify").then((mod) => {
      setToastContainer(() => mod.ToastContainer);
    });
  }, []);

  if (!ToastContainer) {
    return null;
  }

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
}

export default ToastProvider;