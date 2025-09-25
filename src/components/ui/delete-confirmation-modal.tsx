"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiLoader } from "react-icons/fi";
import ReactCountryFlag from "react-country-flag";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  server: any;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

const DeleteConfirmationModal = ({
  isOpen,
  server,
  onClose,
  onDelete,
}: DeleteConfirmationModalProps) => {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmEnabled = confirmText.toLowerCase() === "delete";

  return (
    <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 ${isOpen ? "block" : "hidden"}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex items-center mb-6">
          <div className="p-2 bg-red-100 rounded-full mr-3">
            <FiAlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Delete Server</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-6">
            This action <span className="font-semibold text-red-600">cannot be undone</span>. 
            This will permanently delete the <span className="font-semibold">{server?.name}</span> server.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-7 rounded-md overflow-hidden shadow-sm border border-gray-200 bg-white">
                <ReactCountryFlag
                  countryCode={server?.country}
                  svg
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {server?.name}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {server?.ip}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
              Please type <span className="font-mono text-red-600">delete</span> to confirm
            </label>
            <input
              type="text"
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              placeholder="delete"
              disabled={isDeleting}
            />
          </div>
        </div>
        
        <div className="flex space-x-3 justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </motion.button>
          
          <motion.button
            whileHover={isConfirmEnabled && !isDeleting ? { scale: 1.02 } : {}}
            whileTap={isConfirmEnabled && !isDeleting ? { scale: 0.98 } : {}}
            onClick={handleDelete}
            disabled={!isConfirmEnabled || isDeleting}
            className={`px-4 py-2 bg-red-600 text-white rounded-lg transition-colors flex items-center ${
              !isConfirmEnabled || isDeleting ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
            }`}
          >
            {isDeleting ? (
              <FiLoader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FiAlertTriangle className="mr-2 h-4 w-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete Server"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteConfirmationModal;