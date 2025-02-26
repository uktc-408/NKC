import React from 'react';
import { createPortal } from 'react-dom';

const ImageViewer = ({ src, onClose }) => {
  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <img 
        src={src} 
        alt="Preview image"
        className="max-w-[90vw] max-h-[90vh] object-contain"
        onClick={e => e.stopPropagation()}
      />
    </div>,
    document.body
  );
};

export default ImageViewer;