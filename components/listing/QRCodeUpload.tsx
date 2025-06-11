"use client";

import { useState, useCallback, useEffect } from "react";
import { TbQrcode, TbX, TbCopy, TbCheck, TbRefresh } from "react-icons/tb";
import QRCode from "qrcode";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import Button from "../Button";
import Modal from "../models/Modal";
import Heading from "../Heading";

interface QRCodeUploadProps {
  listingId: string;
  listingTitle: string;
  onImagesAdded?: () => void;
}

export default function QRCodeUpload({ 
  listingId, 
  listingTitle,
  onImagesAdded 
}: QRCodeUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  const generateQRCode = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Generate upload token
      const response = await axios.post(`/api/listings/${listingId}/upload-token`);
      const { uploadUrl: url, expiresAt: expiry } = response.data;
      
      setUploadUrl(url);
      setExpiresAt(new Date(expiry));
      
      // Generate QR code
      const qrCode = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && !qrCodeUrl) {
      generateQRCode();
    }
  }, [isOpen, qrCodeUrl, generateQRCode]);

  const handleCopyLink = useCallback(() => {
    if (uploadUrl) {
      navigator.clipboard.writeText(uploadUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      
      setTimeout(() => setCopied(false), 2000);
    }
  }, [uploadUrl]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQrCodeUrl("");
    setUploadUrl("");
    setExpiresAt(null);
    
    // Trigger refresh if provided
    if (onImagesAdded) {
      onImagesAdded();
    }
  }, [onImagesAdded]);

  const formatTimeRemaining = useCallback(() => {
    if (!expiresAt) return "";
    
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minutes`;
  }, [expiresAt]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Upload Images via Mobile"
        subtitle="Scan this QR code with your phone to upload images"
      />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : qrCodeUrl ? (
        <>
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg relative">
              <Image 
                src={qrCodeUrl} 
                alt="QR Code" 
                width={256} 
                height={256}
                unoptimized // QR codes are already optimized
              />
            </div>
          </div>
          
          {/* Expiration Notice */}
          <div className="text-center text-sm text-gray-600">
            Valid for: <strong>{formatTimeRemaining()}</strong>
          </div>
          
          {/* Copy Link Option */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2 text-center">
              Or share this link:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={uploadUrl}
                readOnly
                className="flex-1 p-2 text-sm border rounded-md bg-gray-50"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                small
                label={copied ? "Copied!" : "Copy"}
                onClick={handleCopyLink}
                icon={copied ? TbCheck : TbCopy}
              />
            </div>
          </div>
          
          {/* Instructions */}
          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Instructions:</h4>
            <ol className="text-sm text-gray-700 space-y-1">
              <li>1. Scan the QR code with your phone camera</li>
              <li>2. Upload up to 5 images at a time</li>
              <li>3. Images will be added to your listing automatically</li>
              <li>4. The link expires in 30 minutes for security</li>
            </ol>
          </div>
          
          {/* Regenerate Button */}
          <div className="flex justify-center">
            <Button
              small
              outline
              label="Generate New Code"
              onClick={generateQRCode}
              icon={TbRefresh}
            />
          </div>
        </>
      ) : null}
    </div>
  );

  return (
    <>
      <Button
        outline
        label="Upload via Phone"
        onClick={() => setIsOpen(true)}
        icon={TbQrcode}
      />
      
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleClose}
        title="Mobile Upload"
        actionLabel="Done"
        body={bodyContent}
      />
    </>
  );
}