"use client";

import { useCallback } from "react";
import useConfirmModal from "@/hook/useConfirmModal";
import Modal from "./Modal";

const ConfirmModal = () => {
  const { 
    isOpen, 
    title, 
    subtitle, 
    actionLabel = "Confirm", 
    onConfirm, 
    onClose 
  } = useConfirmModal();

  const handleConfirm = useCallback(() => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  }, [onConfirm, onClose]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div className="text-lg font-semibold">{title}</div>
      {subtitle && (
        <div className="text-neutral-600">{subtitle}</div>
      )}
    </div>
  );

  return (
    <Modal
      disabled={false}
      isOpen={isOpen}
      title="Confirm Action"
      actionLabel={actionLabel}
      secondaryActionLabel="Cancel"
      onClose={onClose}
      onSubmit={handleConfirm}
      secondaryAction={onClose}
      body={bodyContent}
    />
  );
};

export default ConfirmModal;