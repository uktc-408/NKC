import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ImagePreviewModal({ image, alt, onClose }) {
  // Close on ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={handleBackdropClick} // Use new handler function
    >
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="relative">
          {/* Loading animation */}
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg">
            <div className="w-8 h-8 border-4 border-cyan-400/50 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
          
          <img
            src={image}
            alt={alt}
            className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl"
            style={{ minWidth: '300px', minHeight: '300px' }}
            onLoad={(e) => {
              e.target.previousSibling.style.display = 'none';
            }}
            onClick={e => e.stopPropagation()} // Prevent image click event bubbling
          />
        </div>

        {/* Close button */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent close button click event bubbling
            onClose();
          }}
          className="absolute -top-3 -right-3 bg-gray-800 text-gray-300 rounded-full p-2 hover:bg-gray-700 transition-colors shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
} 