import React, { useState, useEffect, useRef } from 'react';

const SubcategoryCard = ({ subcategory, categorySlug, isMobile }) => {
  const handleClick = (e) => {
    e.preventDefault();
    window.location.href = `/products/category/${categorySlug}/${subcategory.slug}`;
  };

  return (
    <>
      <style>{cardStyles}</style>
      <div
        onClick={handleClick}
        className={`subcategory-card ${isMobile ? 'mobile' : ''}`}
      >
        <div className="card-image-wrapper">
          {subcategory.image ? (
            <>
              <img
                src={subcategory.image}
                alt={subcategory.name}
                className="card-image"
                loading="lazy"
                draggable="false"
              />
              <div className="card-overlay"></div>
            </>
          ) : (
            <div className="card-placeholder"></div>
          )}
          
          <div className="card-content">
            <h3 className="card-title">
              {subcategory.name}
            </h3>
          </div>
        </div>
      </div>
    </>
  );
};

const InfiniteScrollCarousel = ({ items, categorySlug }) => {
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);
  const isManualScrolling = useRef(false);

  // Quintuple the items for smoother infinite scrolling
  const infiniteItems = [...items, ...items, ...items, ...items, ...items];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || items.length === 0) return;

    // Start at the middle set
    const initScroll = () => {
      const card = container.querySelector('.subcategory-card');
      if (card) {
        const cardWidth = card.offsetWidth;
        const gap = parseFloat(getComputedStyle(container).gap) || 12;
        const itemWidth = cardWidth + gap;
        // Position at the middle (2nd copy)
        container.scrollLeft = itemWidth * items.length * 2;
      }
    };

    // Small delay to ensure cards are rendered
    setTimeout(initScroll, 50);

    const handleScroll = () => {
      if (isManualScrolling.current) return;

      clearTimeout(scrollTimeout.current);
      
      scrollTimeout.current = setTimeout(() => {
        const card = container.querySelector('.subcategory-card');
        if (!card) return;

        const cardWidth = card.offsetWidth;
        const gap = parseFloat(getComputedStyle(container).gap) || 12;
        const itemWidth = cardWidth + gap;
        const itemSetWidth = itemWidth * items.length;
        const currentScroll = container.scrollLeft;

        // If we're near the beginning (first copy), jump to second copy
        if (currentScroll < itemSetWidth) {
          isManualScrolling.current = true;
          container.scrollLeft = currentScroll + itemSetWidth * 2;
          setTimeout(() => { isManualScrolling.current = false; }, 50);
        } 
        // If we're near the end (last copy), jump to third copy
        else if (currentScroll > itemSetWidth * 3) {
          isManualScrolling.current = true;
          container.scrollLeft = currentScroll - itemSetWidth * 2;
          setTimeout(() => { isManualScrolling.current = false; }, 50);
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout.current);
    };
  }, [items.length]);

  return (
    <>
      <style>{carouselStyles}</style>
      <div 
        ref={scrollRef}
        className="carousel-container infinite-scroll"
      >
        {infiniteItems.map((item, index) => (
          <SubcategoryCard
            key={`${item._id || item.id}-${index}`}
            subcategory={item}
            categorySlug={categorySlug}
            isMobile={true}
          />
        ))}
      </div>
    </>
  );
};

const SubcategoriesShowcase = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const categorySlug = 'precious-beads-necklace';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    setLoading(true);
    
    try {
      const baseUrl = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
      
      const response = await fetch(
        `${baseUrl}/subcategories/category/${categorySlug}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        console.warn(`API returned ${response.status}`);
        setSubcategories([]);
        return;
      }
      
      const data = await response.json();
      const subcategoriesArray = Array.isArray(data) ? data : [];
      setSubcategories(subcategoriesArray);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{sectionStyles}</style>
        <section className="loading-section">
          <div className="spinner"></div>
        </section>
      </>
    );
  }

  if (subcategories.length === 0) {
    return null;
  }

  return (
    <>
      <style>{sectionStyles}</style>
      <section className="subcategories-section">
        {/* Header */}
        <div className="section-header">
          <div className="header-ornament">
            <div className="ornament-line left"></div>
            <span className="ornament-icon large">◆</span>
            <span className="ornament-icon small">✦</span>
            <span className="ornament-icon large">◆</span>
            <div className="ornament-line right"></div>
          </div>
          <h1 className="section-title">
            Explore Precious Stones
          </h1>
          <div className="title-divider">
            <span className="divider-icon">✦</span>
            <div className="divider-line"></div>
            <span className="divider-icon">✦</span>
          </div>
          <p className="section-subtitle">
            Discover our exquisite collection of precious gemstone beads
          </p>
        </div>

        {/* Mobile: Infinite Sliding Carousel */}
        {isMobile ? (
          <InfiniteScrollCarousel 
            items={subcategories} 
            categorySlug={categorySlug}
          />
        ) : (
          /* Desktop: Grid Layout */
          <div className="grid-container">
            <div className="grid-layout">
              {subcategories.map((subcategory) => (
                <SubcategoryCard
                  key={subcategory._id || subcategory.id}
                  subcategory={subcategory}
                  categorySlug={categorySlug}
                  isMobile={false}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

const sectionStyles = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.subcategories-section {
  width: 100%;
  background: linear-gradient(to bottom, #f5f0e8, #ffffff);
  padding: clamp(1.5rem, 3vw, 5rem) 0 clamp(1.5rem, 3vw, 3rem) 0;
  overflow-x: hidden;
}

.section-header {
  text-align: center;
  padding: 0 clamp(1rem, 3vw, 2rem);
  margin-bottom: clamp(1rem, 2vw, 4rem);
}

.header-ornament {
  display: inline-flex;
  align-items: center;
  gap: clamp(0.4rem, 1vw, 1rem);
  margin-bottom: clamp(0.3rem, 0.75vw, 0.75rem);
}

.ornament-line {
  height: 1px;
  width: clamp(1.5rem, 4vw, 4rem);
}

.ornament-line.left {
  background: linear-gradient(to right, transparent, #C9A557);
}

.ornament-line.right {
  background: linear-gradient(to left, transparent, #C9A557);
}

.ornament-icon {
  color: #C9A557;
}

.ornament-icon.large {
  font-size: clamp(0.875rem, 1.5vw, 1.25rem);
}

.ornament-icon.small {
  font-size: clamp(0.625rem, 1vw, 0.875rem);
}

.section-title {
  font-size: clamp(1.5rem, 4vw, 4rem);
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #6B5D4F;
  margin-bottom: clamp(0.4rem, 0.75vw, 0.75rem);
  text-shadow: 0 2px 10px rgba(107, 93, 79, 0.2), 0 1px 4px rgba(139, 115, 85, 0.15);
  line-height: 1.2;
}

.title-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.4rem, 0.75vw, 0.75rem);
  margin-bottom: clamp(0.3rem, 0.75vw, 0.75rem);
}

.divider-icon {
  color: #C9A557;
  font-size: clamp(0.625rem, 0.875vw, 0.875rem);
}

.divider-line {
  height: 1px;
  width: clamp(1.25rem, 2.5vw, 2rem);
  background: #C9A557;
}

.section-subtitle {
  font-size: clamp(0.75rem, 1.25vw, 1.25rem);
  color: #8B7355;
  font-weight: 300;
  letter-spacing: 0.03em;
  text-shadow: 0 1px 4px rgba(139, 115, 85, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

.grid-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 3vw, 2rem);
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(1rem, 2vw, 1.5rem);
}

@media (min-width: 640px) {
  .grid-layout {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-layout {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1280px) {
  .grid-layout {
    grid-template-columns: repeat(5, 1fr);
  }
}

.loading-section {
  width: 100%;
  min-height: 50vh;
  background: linear-gradient(to bottom, #f5f0e8, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: clamp(2rem, 4vw, 3rem);
  height: clamp(2rem, 4vw, 3rem);
  border: 2px solid #C9A557;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

const carouselStyles = `
.carousel-container {
  display: flex;
  overflow-x: scroll;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
}

.carousel-container::-webkit-scrollbar {
  display: none;
}

.carousel-container.infinite-scroll {
  gap: 0.75rem;
  padding: 0 clamp(1rem, 3vw, 1.5rem);
}

.carousel-container.infinite-scroll .subcategory-card {
  scroll-snap-align: start;
}
`;

const cardStyles = `
.subcategory-card {
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.subcategory-card.mobile {
  width: clamp(130px, 32vw, 160px);
}

.card-image-wrapper {
  position: relative;
  aspect-ratio: 4/5;
  overflow: hidden;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #f5f0e8 0%, #e8dfd0 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.9);
  user-select: none;
  -webkit-user-drag: none;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.65) 0%,
    rgba(0, 0, 0, 0.25) 40%,
    transparent 100%
  );
  pointer-events: none;
}

.card-placeholder {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(201, 165, 87, 0.3), rgba(139, 115, 85, 0.3));
}

.card-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 0.5rem;
  pointer-events: none;
}

.card-title {
  color: white;
  font-size: clamp(0.55rem, 1.3vw, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
  word-break: break-word;
}

@media (max-width: 767px) {
  .subcategory-card:active {
    transform: scale(0.97);
    transition: transform 0.1s ease;
  }
}

@media (min-width: 768px) {
  .card-image-wrapper {
    border-radius: clamp(0.75rem, 1.5vw, 1rem);
  }
  
  .card-title {
    font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  }
}
`;

export default SubcategoriesShowcase;