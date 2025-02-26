import { useState, useEffect } from 'react';
import TwitterSearchResults from './Main/TwitterSearchResults';
import ImageViewer from './Common/ImageViewer';
import SlideUp from './Sliedup/SlideUp';
import Navbar from './Content/Navbar';
import CyberBackground from './Content/CyberBackground';
import CyberIntroText from './Content/CyberIntroText';
import { useNavigate, useParams } from 'react-router-dom';

export default function TwitterSearch({ initialAddress }) {
  const [searchParams, setSearchParams] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (initialAddress && !searchParams) {
      handleSearch({
        address: initialAddress,
        mode: 'contract'
      });
    }
  }, [initialAddress, searchParams]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = (params) => {
    setSearchParams(params);
    setIsSlideUpOpen(true);
    
    if (params.mode === 'contract') {
      navigate(`/${params.address}`);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleImagePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <CyberBackground simplified={isSlideUpOpen} disabled={isMobile} />
      
        <div className="absolute top-[30%] left-0 right-0 z-10">
          <div className="max-w-2xl mx-auto">
            <CyberIntroText />
          </div>
        </div>
      
      <Navbar onSearch={handleSearch} />
      
      <div className="relative h-full">
        <div className="max-w-4xl mx-auto">
          <SlideUp 
            isOpen={isSlideUpOpen} 
            onClose={() => setIsSlideUpOpen(false)}
          >
            <TwitterSearchResults 
              searchParams={searchParams}
              onImagePreview={handleImagePreview}
            />
          </SlideUp>
          
          {previewImage && (
            <ImageViewer
              src={previewImage}
              onClose={() => setPreviewImage(null)}
            />
          )}

          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
              aria-label="back to top"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 10l7-7m0 0l7 7m-7-7v18" 
                />
              </svg>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}