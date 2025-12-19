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
/*  Infinite-scroll carousel WITH swipe support                       */
/* ------------------------------------------------------------------ */
const InfiniteScrollCarousel = ({ items, categorySlug }) => {
  const scrollRef = useRef(null);
  const isManualScrolling = useRef(false);

  // Triple the items for seamless infinite loop
  const infiniteItems = [...items, ...items, ...items];

  /* ---------- Initialize scroll position ---------- */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !items.length) return;

    const initScroll = () => {
      const card = container.querySelector('.subcategory-card');
      if (!card) return;
      const cardWidth = card.offsetWidth;
      const gap = parseFloat(getComputedStyle(container).gap) || 12;
      const itemWidth = cardWidth + gap;
      container.scrollLeft = itemWidth * items.length;
    };
    
    setTimeout(initScroll, 100);
  }, [items.length]);

  /* ---------- Infinite loop handler ---------- */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !items.length) return;

    const handleScroll = () => {
      if (isManualScrolling.current) return;

      const card = container.querySelector('.subcategory-card');
      if (!card) return;
      
      const cardWidth = card.offsetWidth;
      const gap = parseFloat(getComputedStyle(container).gap) || 12;
      const itemWidth = cardWidth + gap;
      const itemSetWidth = itemWidth * items.length;
      const scrollLeft = container.scrollLeft;

      if (scrollLeft < itemSetWidth * 0.5) {
        isManualScrolling.current = true;
        container.scrollLeft = scrollLeft + itemSetWidth;
        setTimeout(() => {
          isManualScrolling.current = false;
        }, 50);
      }
      else if (scrollLeft > itemSetWidth * 2.5) {
        isManualScrolling.current = true;
        container.scrollLeft = scrollLeft - itemSetWidth;
        setTimeout(() => {
          isManualScrolling.current = false;
        }, 50);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [items.length]);

  /* ---------- Swipe/drag support ---------- */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let startX = 0;
    let scrollStart = 0;
    let dragging = false;

    const onPointerDown = (e) => {
      dragging = true;
      startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      scrollStart = el.scrollLeft;
      el.style.scrollSnapType = 'none';
      el.style.scrollBehavior = 'auto';
    };

    const onPointerMove = (e) => {
      if (!dragging) return;
      e.preventDefault();
      const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      const walk = (startX - x) * 1.5;
      el.scrollLeft = scrollStart + walk;
    };

    const onPointerUp = () => {
      dragging = false;
      el.style.scrollSnapType = 'x mandatory';
      el.style.scrollBehavior = 'smooth';
    };

    el.addEventListener('mousedown', onPointerDown);
    el.addEventListener('touchstart', onPointerDown, { passive: true });

    window.addEventListener('mousemove', onPointerMove, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });

    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    return () => {
      el.removeEventListener('mousedown', onPointerDown);
      el.removeEventListener('touchstart', onPointerDown);

      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);

      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, []);

  return (
    <>
      <style>{carouselStyles}</style>
      <div ref={scrollRef} className="carousel-container infinite-scroll">
        {infiniteItems.map((item, idx) => (
          <SubcategoryCard
            key={`${item._id || item.id}-${idx}`}
            subcategory={item}
            categorySlug={categorySlug}
            isMobile={true}
          />
        ))}
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
          <div className="title-divider">
            <span className="divider-icon">✦</span>
            <div className="divider-line"></div>
            <span className="divider-icon">✦</span>
          </div>
          <p className="section-subtitle">
            Discover our exquisite collection of precious gemstone beads
          </p>
        </div>

        {/* ---------- content ---------- */}
        {isMobile ? (
          <InfiniteScrollCarousel items={subcategories} categorySlug={categorySlug} />
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
/*  Styles - Fully Responsive                                         */
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

/* ========== MOBILE FIRST (320px - 639px) ========== */
@media (max-width: 639px) {
  .subcategories-section {
    padding: 2rem 0 2rem 0;
  }
}

.section-header { 
  text-align: center; 
  padding: 0 1rem;
  margin-bottom: clamp(1.5rem, 4vw, 4rem);
}

/* ========== MOBILE HEADER ========== */
@media (max-width: 639px) {
  .section-header {
    padding: 0 0.75rem;
    margin-bottom: 1.5rem;
  }
}

.header-ornament { 
  display: inline-flex; 
  align-items: center; 
  gap: clamp(0.4rem, 1vw, 1rem);
  margin-bottom: clamp(0.25rem, 0.75vw, 0.75rem);
}

@media (max-width: 639px) {
  .header-ornament {
    gap: 0.4rem;
    margin-bottom: 0.4rem;
  }
}

.ornament-line { 
  height: 1px; 
  width: clamp(1rem, 4vw, 4rem);
}

@media (max-width: 639px) {
  .ornament-line {
    width: 1.5rem;
  }
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
  font-size: clamp(0.75rem, 1.5vw, 1.25rem);
}

.ornament-icon.small { 
  font-size: clamp(0.5rem, 1vw, 0.875rem);
}

@media (max-width: 639px) {
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
  color: #6B5D4F; 
  margin-bottom: clamp(0.3rem, 0.75vw, 0.75rem);
  text-shadow: 0 2px 10px rgba(107, 93, 79, 0.2), 0 1px 4px rgba(139, 115, 85, 0.15); 
  line-height: 1.2; 
  font-family: 'sans-serif';
}

@media (max-width: 639px) {
  .section-title {
    font-size: 1.75rem;
    margin-bottom: 0.4rem;
    letter-spacing: 0.03em;
  }
}

@media (min-width: 640px) and (max-width: 1023px) {
  .section-title {
    font-size: 2.5rem;
  }
}

.title-divider { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: clamp(0.3rem, 0.75vw, 0.75rem);
  margin-bottom: clamp(0.25rem, 0.75vw, 0.75rem);
}

@media (max-width: 639px) {
  .title-divider {
    gap: 0.4rem;
    margin-bottom: 0.4rem;
  }
}

.divider-icon { 
  color: #C9A557; 
  font-size: clamp(0.5rem, 0.875vw, 0.875rem);
}

@media (max-width: 639px) {
  .divider-icon {
    font-size: 0.625rem;
  }
}

.divider-line { 
  height: 1px; 
  width: clamp(1rem, 2.5vw, 2rem);
  background: #C9A557; 
}

@media (max-width: 639px) {
  .divider-line {
    width: 1.25rem;
  }
}

.section-subtitle { 
  font-size: clamp(0.875rem, 1.5vw, 1.25rem);
  color: #8B7355; 
  font-weight: 300; 
  letter-spacing: 0.03em; 
  text-shadow: 0 1px 4px rgba(139, 115, 85, 0.1); 
  max-width: 800px; 
  margin: 0 auto;
  padding: 0 1rem;
}

@media (max-width: 639px) {
  .section-subtitle {
    font-size: 0.8rem;
    padding: 0 0.5rem;
    line-height: 1.4;
  }
}

@media (min-width: 640px) and (max-width: 1023px) {
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

@media (max-width: 639px) {
  .spinner {
    width: 2rem;
    height: 2rem;
  }
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
  cursor: grab;
}
.carousel-container::-webkit-scrollbar { display: none; }

/*  MOBILE  –  tighter gap  */
.carousel-container.infinite-scroll { 
  gap: 0.375rem;              /*  6 px  */
  padding: 0 0.5rem;          /*  8 px side padding  */
}
@media (max-width: 639px) {
  .carousel-container.infinite-scroll {
    gap: 0.25rem;             /*  4 px  */
    padding: 0 0.375rem;
  }
}
.carousel-container.infinite-scroll .subcategory-card { scroll-snap-align: start; }
`;

const cardStyles = `
.subcategory-card { 
  cursor: pointer; 
  flex-shrink: 0; 
  -webkit-tap-highlight-color: transparent; 
}

/* ==========  MOBILE : 20 vw  –  5 cards in view  ========== */
.subcategory-card.mobile { 
  width: 20vw;
  max-width: 120px;
  min-width: 80px;
}

/*  tiny phones  */
@media (max-width: 374px) {
  .subcategory-card.mobile { 
    width: 19vw; 
    min-width: 70px; 
    transform: scale(0.92);   /*  visual shrink, keeps gap  */
    transform-origin: center;
  }
}

/*  small phones  */
@media (min-width: 375px) and (max-width: 424px) {
  .subcategory-card.mobile { 
    width: 19.5vw; 
    min-width: 75px; 
    transform: scale(0.95);
    transform-origin: center;
  }
}

/* ----------  desktop untouched  ---------- */
.subcategory-card:not(.mobile) { width: 100%; }

/* ----------  image wrapper  ---------- */
.card-image-wrapper { 
  position: relative; 
  aspect-ratio: 3 / 3.5; 
  overflow: hidden; 
  border-radius: clamp(0.35rem, 1.8vw, 0.6rem); 
  background: linear-gradient(135deg, #f5f0e8 0%, #e8dfd0 100%); 
  box-shadow: 0 1.5px 5px rgba(0,0,0,.10); 
}

/* ----------  image  ---------- */
.card-image { 
  position: absolute; inset: 0; 
  width: 100%; height: 100%; 
  object-fit: cover; 
  filter: brightness(0.9); 
  user-select: none; 
  -webkit-user-drag: none; 
}

/* ----------  overlay & content  ---------- */
.card-overlay { 
  position: absolute; inset: 0; 
  background: linear-gradient(to top, rgba(0,0,0,.65) 0%, rgba(0,0,0,.25) 40%, transparent 100%); 
  pointer-events: none; 
}
.card-content { 
  position: absolute; inset: 0; 
  display: flex; align-items: flex-end; 
  padding: clamp(0.35rem, 1.4vw, 0.55rem); 
  pointer-events: none; 
}

/* ----------  title  ---------- */
.card-title { 
  color: #fff; 
  font-size: clamp(0.6rem, 1.3vw, 0.7rem); 
  font-weight: 600; 
  letter-spacing: 0.01em; 
  text-transform: uppercase; 
  text-shadow: 0 1px 2px rgba(0,0,0,.6); 
  line-height: 1.2; 
  word-break: break-word; 
}

/* ----------  press-down feedback  ---------- */
@media (max-width: 1023px) { 
  .subcategory-card:active { transform: scale(0.96); transition: transform .1s ease; } 
}
`;

export default SubcategoriesShowcase;