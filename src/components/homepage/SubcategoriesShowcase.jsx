import React, { useState, useEffect, useRef } from 'react';
import { useHomePageTheme } from '../../pages/HomePage';

/* ------------------------------------------------------------------ */
/*  Sub-category card                                                 */
/* ------------------------------------------------------------------ */
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
            <h3 className="card-title">{subcategory.name}</h3>
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Mobile smooth carousel (like recommended products)                */
/* ------------------------------------------------------------------ */
const MobileSmoothCarousel = ({ items, categorySlug }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const carouselRef = useRef(null);

  const updateButtons = () => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    setScrollPosition(el.scrollLeft);
  };

  const scroll = (dir) => {
    if (!carouselRef.current) return;
    const cardWidth = window.innerWidth < 400 ? 98 : window.innerWidth < 500 ? 112 : 126;
    carouselRef.current.scrollBy({
      left: dir === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
    setTimeout(updateButtons, 300);
  };

  useEffect(() => {
    updateButtons();
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);
    return () => {
      el.removeEventListener('scroll', updateButtons);
      window.removeEventListener('resize', updateButtons);
    };
  }, [items]);

  return (
    <>
      <style>{mobileCarouselStyles}</style>
      <div className="mobile-carousel-wrapper">
        {/* Scroll dots */}
        <div className="carousel-dots">
          {items.slice(0, Math.min(items.length, 6)).map((_, idx) => {
            const cardWidth = window.innerWidth < 400 ? 98 : window.innerWidth < 500 ? 112 : 126;
            const currentIndex = Math.round(scrollPosition / cardWidth);
            return (
              <div
                key={idx}
                className={`dot ${currentIndex === idx ? 'active' : ''}`}
              />
            );
          })}
        </div>

        {/* Navigation arrows */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="carousel-arrow left"
            aria-label="Scroll left"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="carousel-arrow right"
            aria-label="Scroll right"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={carouselRef}
          className="mobile-carousel-container"
        >
          {items.map((item, idx) => (
            <SubcategoryCard
              key={item._id || item.id || idx}
              subcategory={item}
              categorySlug={categorySlug}
              isMobile={true}
            />
          ))}
        </div>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Main showcase                                                      */
/* ------------------------------------------------------------------ */
const SubcategoriesShowcase = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const theme = useHomePageTheme();

  const categorySlug = 'precious-beads-necklace';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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
      const base = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${base}/subcategories/category/${categorySlug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        console.warn(`API returned ${res.status}`);
        setSubcategories([]);
        return;
      }
      const data = await res.json();
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <>
        <style>{sectionStyles}</style>
        <section className="loading-section" style={{ backgroundColor: theme.subcategoriesBg }}>
          <div className="spinner"></div>
        </section>
      </>
    );

  if (!subcategories.length) return null;

  return (
    <>
      <style>{sectionStyles}</style>
      <section className="subcategories-section" style={{ backgroundColor: theme.subcategoriesBg }}>
        {/* ---------- header ---------- */}
        <div className="section-header">
          <div className="header-ornament">
            <div className="ornament-line left"></div>
            <span className="ornament-icon large">◆</span>
            <span className="ornament-icon small">✦</span>
            <span className="ornament-icon large">◆</span>
            <div className="ornament-line right"></div>
          </div>
          <h1 className="section-title">Explore Precious Stones</h1>
          <p className="section-subtitle">
            Discover our exquisite collection of precious gemstone beads
          </p>
        </div>

        {/* ---------- content ---------- */}
        {isMobile ? (
          <MobileSmoothCarousel items={subcategories} categorySlug={categorySlug} />
        ) : (
          <div className="grid-container">
            <div className="grid-layout">
              {subcategories.map((sub) => (
                <SubcategoryCard
                  key={sub._id || sub.id}
                  subcategory={sub}
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

/* ------------------------------------------------------------------ */
/*  Styles - Part 1: Section & Header                                 */
/* ------------------------------------------------------------------ */
const sectionStyles = `
* { 
  box-sizing: border-box; 
  margin: 0; 
  padding: 0; 
}

.subcategories-section {
  width: 100%;
  padding: clamp(1.5rem, 4vw, 5rem) 0 clamp(1.5rem, 4vw, 3rem) 0;
  overflow-x: hidden;
}

@media (max-width: 767px) {
  .subcategories-section {
    padding: 1.5rem 0 1.75rem 0;
  }
}

.section-header { 
  text-align: center; 
  padding: 0 1rem;
  margin-bottom: clamp(1.5rem, 4vw, 4rem);
}

@media (max-width: 767px) {
  .section-header {
    padding: 0 0.75rem;
    margin-bottom: 1.75rem;
  }
}

.header-ornament { 
  display: inline-flex; 
  align-items: center; 
  gap: clamp(0.4rem, 1vw, 1rem);
  margin-bottom: clamp(0.25rem, 0.75vw, 0.75rem);
}

@media (max-width: 767px) {
  .header-ornament {
    gap: 0.4rem;
    margin-bottom: 0.4rem;
  }
}

.ornament-line { 
  height: 1px; 
  width: clamp(1rem, 4vw, 4rem);
}

@media (max-width: 767px) {
  .ornament-line {
    width: 1.5rem;
  }
}

.ornament-line.left { 
  background: linear-gradient(to right, transparent, #142e5eff); 
}

.ornament-line.right { 
  background: linear-gradient(to left, transparent, #142e5eff); 
}

.ornament-icon { 
  color: #142e5eff; 
}

.ornament-icon.large { 
  font-size: clamp(0.75rem, 1.5vw, 1.25rem);
}

.ornament-icon.small { 
  font-size: clamp(0.5rem, 1vw, 0.875rem);
}

@media (max-width: 767px) {
  .ornament-icon.large {
    font-size: 0.875rem;
  }
  .ornament-icon.small {
    font-size: 0.625rem;
  }
}

.section-title { 
  font-size: clamp(1.5rem, 5vw, 4rem);
  font-weight: 600; 
  letter-spacing: 0.05em; 
  color: #10254b; 
  margin-bottom: clamp(0.3rem, 0.75vw, 0.75rem);
  text-shadow: 0 2px 10px rgba(107, 93, 79, 0.2), 0 1px 4px rgba(139, 115, 85, 0.15); 
  line-height: 1.2; 
  font-family: 'sans-serif';
}

@media (max-width: 767px) {
  .section-title {
    font-size: 1.75rem;
    margin-bottom: 0.4rem;
    letter-spacing: 0.03em;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .section-title {
    font-size: 2.5rem;
  }
}

.section-subtitle { 
  font-size: clamp(0.875rem, 1.5vw, 1.25rem);
  color: #1a3974ff; 
  font-weight: 300; 
  letter-spacing: 0.03em; 
  text-shadow: 0 1px 4px rgba(139, 115, 85, 0.1); 
  max-width: 800px; 
  margin: 0 auto;
  padding: 0 1rem;
}

@media (max-width: 767px) {
  .section-subtitle {
    font-size: 0.8rem;
    padding: 0 0.5rem;
    line-height: 1.4;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .section-subtitle {
    font-size: 1rem;
  }
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

@media (min-width: 768px) { 
  .grid-layout { 
    grid-template-columns: repeat(4, 1fr); 
  } 
}

@media (min-width: 1024px) { 
  .grid-layout { 
    grid-template-columns: repeat(4, 1fr); 
  } 
}

@media (min-width: 1280px) { 
  .grid-layout { 
    grid-template-columns: repeat(6, 1fr); 
  } 
}

.loading-section { 
  width: 100%; 
  min-height: 50vh; 
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

@media (max-width: 767px) {
  .spinner {
    width: 2rem;
    height: 2rem;
  }
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}
`;
/* ------------------------------------------------------------------ */
/*  Styles - Part 2: Mobile Carousel                                  */
/* ------------------------------------------------------------------ */
const mobileCarouselStyles = `
.mobile-carousel-wrapper {
  position: relative;
  width: 100%;
  padding: 0;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0 1rem;
}

.dot {
  height: 0.375rem;
  width: 0.375rem;
  border-radius: 50%;
  background-color: rgba(20, 46, 94, 0.3);
  transition: all 0.3s ease;
}

.dot.active {
  width: 1.5rem;
  border-radius: 0.1875rem;
  background-color: #142e5eff;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  padding: 0.5rem;
  border: 1px solid rgba(20, 46, 94, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #142e5eff;
}

.carousel-arrow:hover {
  background-color: #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.carousel-arrow:active {
  transform: translateY(-50%) scale(0.95);
}

.carousel-arrow.left {
  left: 0.5rem;
}

.carousel-arrow.right {
  right: 0.5rem;
}

.carousel-arrow svg {
  width: 1.25rem;
  height: 1.25rem;
}

.mobile-carousel-container {
  display: flex;
  gap: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
  padding: 0.25rem 0.25rem 0.75rem 0.25rem;
  cursor: grab;
  touch-action: pan-x;
}

@media (max-width: 374px) {
  .mobile-carousel-container {
    gap: 0;
    padding: 0.25rem 0.25rem 0.75rem 0.25rem;
  }
}

.mobile-carousel-container::-webkit-scrollbar {
  display: none;
}

.mobile-carousel-container:active {
  cursor: grabbing;
}

/* Ensure smooth scroll with proper snap alignment */
.mobile-carousel-container .subcategory-card {
  scroll-snap-align: center;
  scroll-snap-stop: normal;
}
`;

/* ------------------------------------------------------------------ */
/*  Styles - Part 3: Card Styles                                      */
/* ------------------------------------------------------------------ */
const cardStyles = `
.subcategory-card { 
  cursor: pointer; 
  flex-shrink: 0; 
  -webkit-tap-highlight-color: transparent; 
  transition: transform 0.2s ease;
}

/* Desktop cards - unchanged */
.subcategory-card:not(.mobile) { 
  width: 100%; 
}

/* Mobile cards - CENTER SPOTLIGHT with side previews - SCALED DOWN 70% */
.subcategory-card.mobile { 
  width: 98px;
  min-width: 98px;
  max-width: 98px;
  transform: scale(0.7);
  transform-origin: center;
  margin: 0 -11vw;
}

/* Small phones (320px - 374px) */
@media (max-width: 374px) {
  .subcategory-card.mobile { 
    width: 91px;
    min-width: 91px;
    max-width: 91px;
    margin: 0 -10vw;
  }
}

/* Medium phones (375px - 424px) */
@media (min-width: 375px) and (max-width: 424px) {
  .subcategory-card.mobile { 
    width: 98px;
    min-width: 98px;
    max-width: 98px;
    margin: 0 -9vw;
  }
}

/* Larger phones (425px - 500px) */
@media (min-width: 425px) and (max-width: 500px) {
  .subcategory-card.mobile { 
    width: 112px;
    min-width: 112px;
    max-width: 112px;
    margin: 0 -9vw;
  }
}

/* Large phones and small tablets (501px - 767px) */
@media (min-width: 501px) and (max-width: 767px) {
  .subcategory-card.mobile { 
    width: 126px;
    min-width: 126px;
    max-width: 126px;
    margin: 0 -4vw;
  }
}

/* Card hover effect for desktop only */
@media (min-width: 768px) {
  .subcategory-card:hover {
    transform: translateY(-4px);
  }
}

/* Image wrapper */
.card-image-wrapper { 
  position: relative; 
  aspect-ratio: 3 / 3.5; 
  overflow: hidden; 
  border-radius: clamp(0.5rem, 1.8vw, 0.75rem); 
  background: linear-gradient(135deg, #f5f0e8 0%, #e8dfd0 100%); 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
  transition: box-shadow 0.2s ease;
}

.subcategory-card:hover .card-image-wrapper {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

@media (max-width: 767px) {
  .card-image-wrapper {
    border-radius: 0.5rem;
  }
}

/* Image */
.card-image { 
  position: absolute; 
  inset: 0; 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  filter: brightness(0.92); 
  user-select: none; 
  -webkit-user-drag: none; 
  pointer-events: none;
}

/* Placeholder */
.card-placeholder {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #e8dfd0 0%, #f5f0e8 100%);
}

/* Overlay */
.card-overlay { 
  position: absolute; 
  inset: 0; 
  background: linear-gradient(
    to top, 
    rgba(0, 0, 0, 0.7) 0%, 
    rgba(0, 0, 0, 0.3) 40%, 
    transparent 100%
  ); 
  pointer-events: none; 
}

/* Content */
.card-content { 
  position: absolute; 
  inset: 0; 
  display: flex; 
  align-items: flex-end; 
  padding: clamp(0.5rem, 1.4vw, 0.75rem); 
  pointer-events: none; 
}

@media (max-width: 767px) {
  .card-content {
    padding: 0.5rem;
  }
}

/* Title */
.card-title { 
  color: #fff; 
  font-size: clamp(0.7rem, 1.3vw, 0.9rem); 
  font-weight: 600; 
  letter-spacing: 0.02em; 
  text-transform: uppercase; 
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8); 
  line-height: 1.3; 
  word-break: break-word; 
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 767px) {
  .card-title {
    font-size: 0.7rem;
    line-height: 1.2;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .card-title {
    font-size: 0.8rem;
  }
}

/* Active feedback for mobile */
@media (max-width: 767px) { 
  .subcategory-card:active { 
    transform: scale(0.97); 
    transition: transform 0.1s ease; 
  } 
}
`;

export default SubcategoriesShowcase;