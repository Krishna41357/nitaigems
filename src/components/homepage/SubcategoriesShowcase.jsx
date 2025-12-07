import React, { useState, useEffect, useRef } from 'react';

const SubcategoryCard = ({ subcategory, categorySlug, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.location.href = `/products/category/${categorySlug}/${subcategory.slug}`;
  };

  return (
    <>
      <style>{cardStyles}</style>
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`subcategory-card ${isMobile ? 'mobile' : ''}`}
      >
        <div className="card-image-wrapper">
          {subcategory.image ? (
            <>
              <img
                src={subcategory.image}
                alt={subcategory.name}
                className={`card-image ${isHovered ? 'hovered' : ''}`}
                loading="lazy"
              />
              <div className="card-overlay"></div>
            </>
          ) : (
            <div className="card-placeholder"></div>
          )}
          
          <div className="card-content">
            <h3 className={`card-title ${isHovered ? 'hovered' : ''}`}>
              {subcategory.name}
            </h3>
          </div>
        </div>
      </div>
    </>
  );
};

const InfiniteCarousel = ({ items, direction = 'left', categorySlug }) => {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || items.length === 0) return;

    let animationId;
    let scrollPosition = direction === 'left' ? 0 : scrollContainer.scrollWidth / 2;
    
    const scroll = () => {
      if (!isPaused) {
        if (direction === 'left') {
          scrollPosition += 0.5;
          if (scrollPosition >= scrollContainer.scrollWidth / 2) {
            scrollPosition = 0;
          }
        } else {
          scrollPosition -= 0.5;
          if (scrollPosition <= 0) {
            scrollPosition = scrollContainer.scrollWidth / 2;
          }
        }
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [direction, isPaused, items.length]);

  const duplicatedItems = [...items, ...items];

  return (
    <>
      <style>{carouselStyles}</style>
      <div 
        ref={scrollRef}
        className="carousel-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedItems.map((item, index) => (
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

  const midpoint = Math.ceil(subcategories.length / 2);
  const firstLane = subcategories.slice(0, midpoint);
  const secondLane = subcategories.slice(midpoint);

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

        {/* Mobile: Carousel Layout */}
        {isMobile ? (
          <div className="carousel-wrapper">
            <InfiniteCarousel 
              items={firstLane.length > 0 ? firstLane : subcategories} 
              direction="left"
              categorySlug={categorySlug}
            />
            {secondLane.length > 0 && (
              <InfiniteCarousel 
                items={secondLane} 
                direction="right"
                categorySlug={categorySlug}
              />
            )}
          </div>
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
  min-height: 100vh;
  background: linear-gradient(to bottom, #f5f0e8, #ffffff);
  padding: clamp(3rem, 6vw, 5rem) 0;
  overflow-x: hidden;
}

.section-header {
  text-align: center;
  padding: 0 clamp(1rem, 3vw, 2rem);
  margin-bottom: clamp(3rem, 6vw, 4rem);
}

.header-ornament {
  display: inline-flex;
  align-items: center;
  gap: clamp(0.5rem, 1.5vw, 1rem);
  margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
}

.ornament-line {
  height: 1px;
  width: clamp(2rem, 6vw, 4rem);
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
  font-size: clamp(1rem, 1.75vw, 1.25rem);
}

.ornament-icon.small {
  font-size: clamp(0.75rem, 1.25vw, 0.875rem);
}

.section-title {
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #6B5D4F;
  margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
  text-shadow: 0 2px 10px rgba(107, 93, 79, 0.2), 0 1px 4px rgba(139, 115, 85, 0.15);
  line-height: 1.2;
}

.title-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
}

.divider-icon {
  color: #C9A557;
  font-size: clamp(0.75rem, 1vw, 0.875rem);
}

.divider-line {
  height: 1px;
  width: clamp(1.5rem, 3vw, 2rem);
  background: #C9A557;
}

.section-subtitle {
  font-size: clamp(1rem, 1.75vw, 1.25rem);
  color: #8B7355;
  font-weight: 300;
  letter-spacing: 0.03em;
  text-shadow: 0 1px 4px rgba(139, 115, 85, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

.carousel-wrapper {
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vw, 2rem);
  width: 100%;
  overflow: hidden;
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
  min-height: 100vh;
  background: linear-gradient(to bottom, #f5f0e8, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: clamp(2.5rem, 5vw, 3rem);
  height: clamp(2.5rem, 5vw, 3rem);
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
  gap: clamp(1.5rem, 3vw, 2rem);
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.carousel-container::-webkit-scrollbar {
  display: none;
}
`;

const cardStyles = `
.subcategory-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.subcategory-card:active {
  transform: scale(0.98);
}

.subcategory-card.mobile {
  flex-shrink: 0;
  width: clamp(280px, 75vw, 320px);
}

.card-image-wrapper {
  position: relative;
  aspect-ratio: 4/5;
  overflow: hidden;
  border-radius: clamp(1rem, 2vw, 1.5rem);
  background: linear-gradient(135deg, #f5f0e8 0%, #e8dfd0 100%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
  filter: brightness(0.9);
}

.card-image.hovered {
  transform: scale(1.1);
  filter: brightness(0.75);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    transparent 100%
  );
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
  padding: clamp(1.25rem, 3vw, 1.75rem);
}

.card-title {
  color: white;
  font-size: clamp(1rem, 2vw, 1.125rem);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  line-height: 1.3;
}

.card-title.hovered {
  font-size: clamp(1.125rem, 2.25vw, 1.25rem);
  transform: translateY(-4px);
}

@media (max-width: 767px) {
  .subcategory-card:hover {
    transform: none;
  }
  
  .card-image.hovered {
    transform: scale(1.05);
  }
}
`;

export default SubcategoriesShowcase;