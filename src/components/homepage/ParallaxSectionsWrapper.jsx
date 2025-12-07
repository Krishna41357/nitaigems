import React, { useEffect, useRef } from 'react';
import CollectionsSection from './CollectionsSection';
import CategoryCardsSection from './CategoryCardsSection';

const ParallaxSectionsWrapper = () => {
  const wrapperRef = useRef(null);
  const parallaxBgRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current || !parallaxBgRef.current) return;

      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Check if wrapper is in viewport
      if (wrapperRect.top < windowHeight && wrapperRect.bottom > 0) {
        // Calculate parallax offset
        const scrollProgress = -wrapperRect.top;
        parallaxBgRef.current.style.transform = `translateY(${scrollProgress * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div ref={wrapperRef} className="parallax-sections-wrapper">
        {/* Fixed parallax background for both sections */}
        <div 
          ref={parallaxBgRef}
          className="parallax-bg-layer"
        />
        
        {/* Content sections */}
        <div className="parallax-content">
          <CollectionsSection />
          <CategoryCardsSection limit={7} />
        </div>
      </div>
    </>
  );
};

const styles = `
.parallax-sections-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  isolation: isolate;
}

.parallax-bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 150%;
  background-image: url(/bg4.jpg);
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  z-index: 1;
  will-change: transform;
}

.parallax-content {
  position: relative;
  z-index: 2;
}

/* Ensure sections are transparent and positioned correctly */
.parallax-content > * {
  position: relative;
  background: transparent !important;
}

@media (max-width: 768px) {
  .parallax-bg-layer {
    transform: none !important;
    height: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .parallax-bg-layer {
    transform: none !important;
    transition: none !important;
  }
}
`;

export default ParallaxSectionsWrapper;