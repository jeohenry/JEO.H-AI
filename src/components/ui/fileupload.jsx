import React from 'react';
import { UploadCloud } from 'lucide-react';

export const FileUpload = ({ onChange, accept = '*' }) => {
  return (
    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-600 dark:text-gray-300">
      <UploadCloud className="w-8 h-8 mb-2" />
      <span className="text-sm">Click to upload or drag here</span>
      <input
        type="file"
        onChange={onChange}
        accept={accept}
        className="hidden"
      />
    </label>
  );
};