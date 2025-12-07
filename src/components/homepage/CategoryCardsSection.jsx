import React, { useState, useEffect } from 'react';

const CategoryCardsSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.slice(0, 4));
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categorySlug) => {
    window.location.href = `/products/category/${categorySlug}`;
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <section className="loading-section">
          <div className="spinner" />
        </section>
      </>
    );
  }

  if (categories.length === 0) return null;

  const CategoryCard = ({ category, offset = 0 }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <div
        onClick={() => handleCategoryClick(category.slug)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`category-card ${offset ? 'offset' : ''}`}
      >
        {category.image ? (
          <>
            <img
              src={category.image}
              alt={category.name}
              className="category-image"
              loading="lazy"
            />
            <div className="category-overlay" />
          </>
        ) : (
          <div className="category-placeholder" />
        )}
        <div className="category-content">
          <h3 className="category-title">
            {category.name}
            <span className={`title-underline ${isHovered ? 'active' : ''}`} />
          </h3>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <section className="category-section">
        {/* background */}
        <div className="bg-wrapper">
          <img src="https://res.cloudinary.com/dxoxbnptl/image/upload/v1765110873/bg4_gfjtlz.jpg" alt="Background" className="bg-image" />
        </div>
        <div className="bg-overlay" />

        <div className="content-wrapper">
          {/* header */}
          <div className="header-section">
            <h2 className="main-title">Curated Collections</h2>
            <div className="title-divider">
              <div className="divider-line left" />
              <span className="divider-icon">✦</span>
              <div className="divider-line right" />
            </div>
            <p className="subtitle">
              Where tradition meets contemporary elegance
            </p>
          </div>

          {/* cards grid */}
          <div className="cards-container">
            {categories.map((category, index) => (
              <CategoryCard 
                key={category.slug} 
                category={category} 
                offset={index % 2 === 1} 
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

const styles = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.category-section {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem);
}

.bg-wrapper {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: crisp-edges;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.2);
  z-index: 1;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(2rem, 4vw, 3rem);
}

.header-section {
  text-align: center;
  width: 100%;
}

.main-title {
  font-family: serif;
  font-size: clamp(2rem, 5vw, 5rem);
  font-weight: 700;
  color: #eab308;
  text-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(201, 165, 87, 0.3);
  letter-spacing: 0.05em;
  margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
}

.title-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.5rem, 1vw, 1rem);
  margin: clamp(0.5rem, 1vw, 1rem) 0;
}

.divider-line {
  height: 1px;
  width: clamp(2rem, 8vw, 8rem);
  background: #C9A557;
}

.divider-line.left {
  background: linear-gradient(to right, transparent, #C9A557);
}

.divider-line.right {
  background: linear-gradient(to left, transparent, #C9A557);
}

.divider-icon {
  color: #C9A557;
  font-size: clamp(1rem, 1.5vw, 1.25rem);
}

.subtitle {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  color: white;
  font-weight: 300;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
  margin-top: clamp(0.5rem, 1vw, 0.75rem);
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: clamp(1rem, 2vw, 1.5rem);
  width: 100%;
  max-width: 100%;
  align-items: start;
}

@media (min-width: 640px) {
  .cards-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .cards-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

.category-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: clamp(0.5rem, 1vw, 1rem);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.category-card.offset {
  margin-top: clamp(1.5rem, 3vw, 2.5rem);
}

@media (max-width: 1023px) {
  .category-card.offset {
    margin-top: 0;
  }
}

.category-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.category-card:hover .category-image {
  transform: scale(1.1);
}

.category-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #E8DEC9 0%, #D4C5B0 100%);
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    transparent 100%
  );
}

.category-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: clamp(0.75rem, 2vw, 1.5rem);
}

.category-title {
  color: white;
  font-size: clamp(1rem, 1.75vw, 1.25rem);
  font-weight: 300;
  letter-spacing: 0.05em;
  position: relative;
  width: 100%;
  transition: transform 0.3s ease;
}

.category-card:hover .category-title {
  transform: translateY(-4px);
}

.title-underline {
  position: absolute;
  bottom: -4px;
  left: 0;
  height: 2px;
  background: #C9A557;
  width: 0;
  transition: width 0.3s ease;
}

.title-underline.active {
  width: 100%;
}

.loading-section {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #ffffff, #f5f0e8, #ffffff);
}

.spinner {
  width: clamp(2rem, 5vw, 2.5rem);
  height: clamp(2rem, 5vw, 2.5rem);
  border: 2px solid #C9A557;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile Optimization */
@media (max-width: 639px) {
  .category-section {
    padding: 2rem 1rem;
  }
  
  .cards-container {
    gap: 1rem;
  }
  
  .category-card:hover {
    transform: translateY(-4px) scale(1.01);
  }
}

/* Tablet Optimization */
@media (min-width: 640px) and (max-width: 1023px) {
  .cards-container {
    max-width: 600px;
    margin: 0 auto;
  }
}

/* Prevent layout shift */
@media (prefers-reduced-motion: reduce) {
  .category-card,
  .category-image,
  .category-title,
  .title-underline {
    transition: none;
  }
}
`;

export default CategoryCardsSection;