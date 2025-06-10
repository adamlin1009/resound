import { create } from "zustand";

interface ConfirmModalStore {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onConfirm?: () => void;
  onOpen: (data: {
    title: string;
    subtitle?: string;
    message?: string; // Support both subtitle and message
    actionLabel?: string;
    onConfirm: () => void;
  }) => void;
  onClose: () => void;
}

const useConfirmModal = create<ConfirmModalStore>((set) => ({
  isOpen: false,
  title: "",
  subtitle: undefined,
  actionLabel: undefined,
  onConfirm: undefined,
  onOpen: (data) =>
    set({
      isOpen: true,
      title: data.title,
      subtitle: data.subtitle || data.message, // Support both
      actionLabel: data.actionLabel,
      onConfirm: data.onConfirm,
    }),
  onClose: () =>
    set({
      isOpen: false,
      title: "",
      subtitle: undefined,
      actionLabel: undefined,
      onConfirm: undefined,
    }),
}));

export default useConfirmModal;