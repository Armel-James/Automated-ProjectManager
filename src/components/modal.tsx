import { createPortal } from "react-dom";
import { useEffect, type Dispatch, type SetStateAction } from "react";

interface ModalChildren {
  children: React.ReactNode;
  title: string;
  open: boolean;
  onClose: () => void;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void;
  isViewOnly?: boolean;
  isDelete?: boolean;
}

export default function Modal({
  open,
  children,
  title,
  setIsOpen,
  onClose,
  onConfirm,
  isViewOnly = false,
  isDelete = false,
}: ModalChildren) {
  if (!open) return null;

  return createPortal(
    <>
      {/* Blur effect and overlay */}
      <div className="fixed z-40 top-0 left-0 right-0 bottom-0 bg-[rgb(0,0,0,.2)] pointer-events-auto transition-all duration-300 shadow-2xl"></div>
      {/* Modal content */}
      <div className="fixed z-50 bg-white top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 min-w-[340px] w-auto p-6 border-1 border-[#0f6cbd] border-opacity-20 rounded-2xl shadow-2xl flex flex-col gap-4 animate-modal-pop">
        <div className="mb-2 text-2xl font-bold text-[#0f6cbd] tracking-tight drop-shadow w-auto">
          <div>{title}</div>
          {isViewOnly && (
            <div>
              <button
                onClick={() => {
                  onClose();
                  setIsOpen(false);
                }}
                className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="mb-2 animate-fade-in-slow">{children}</div>

        <div className="flex justify-end gap-3 mt-2">
          {isViewOnly == false && (
            <div>
              <button
                onClick={onClose}
                className="px-5 py-2 text-[#0f6cbd] bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6cbd] focus:ring-opacity-50 transition"
              >
                Cancel
              </button>
              {isViewOnly === false && isDelete ? (
                <button
                  onClick={() => {
                    onConfirm();
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all border border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                >
                  Delete
                </button>
              ) : (
                <button
                  onClick={() => {
                    onConfirm();
                  }}
                  className="bg-[#0f6cbd] hover:bg-[#155a8a] text-white font-semibold py-2 px-6 rounded-lg shadow transition border border-[#0f6cbd]"
                >
                  Confirm
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>,
    document.getElementById("portal")!
  );
}
