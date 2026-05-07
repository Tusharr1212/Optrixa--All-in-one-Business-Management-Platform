import { AlertTriangle, X } from 'lucide-react';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmModal = ({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  isLoading = false,
}: Props) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={22} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{message}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="btn-danger flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;