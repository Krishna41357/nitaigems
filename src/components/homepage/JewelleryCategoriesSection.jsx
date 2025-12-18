import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useHomePageTheme } from '../../pages/HomePage';

const ProductCard = ({ product, categorySlug }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  

  const hasDiscount = product.pricing?.discountedPrice && 
    product.pricing.discountedPrice < product.pricing.basePrice;
  const formatPrice = (price) => {
    if (!price) return '₹0';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInWishlist(!isInWishlist);
  };

  const handleProductClick = () => {
    const url = `/product/category/${categorySlug}/${product.sku}`;
    window.location.href = url;
  };

  return (
    <>
      <style>{cardStyles}</style>
      <div 
        onClick={handleProductClick}
        className="product-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="product-image-wrapper">
          <img
            src={product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            className={`product-image primary ${isHovered ? 'hovered' : ''}`}
            loading="lazy"
          />
          
          {product.images?.[1] && (
            <img
              src={product.images[1]}
              alt={product.name}
              className={`product-image secondary ${isHovered ? 'visible' : ''}`}
              loading="lazy"
            />
          )}

          <button
            onClick={handleWishlistToggle}
            className={`wishlist-button ${isInWishlist ? 'active' : ''}`}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`wishlist-icon ${isInWishlist ? 'filled' : ''}`}
            />
          </button>

          {!product.inventory?.inStock && (
            <div className="out-of-stock-overlay">
              <span className="out-of-stock-badge">Out of Stock</span>
            </div>
          )}

          {product.isBestseller && (
            <div className="bestseller-wrapper">
              <div className="bestseller-glow"></div>
              <span className="bestseller-badge">Bestseller</span>
            </div>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">
            {product.name}
          </h3>

          <div className="product-pricing">
            {hasDiscount ? (
              <>
                <p className="price-current">
                  {formatPrice(product.pricing.discountedPrice)}
                </p>
                <p className="price-original">
                  {formatPrice(product.pricing.basePrice)}
                </p>
              </>
            ) : (
              <p className="price-current">
                {formatPrice(product.pricing?.basePrice)}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const JewelleryCategoriesSection = () => {
  const theme = useHomePageTheme();
  const [activeTab, setActiveTab] = useState('precious-beads-necklace');
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const categories = [
    { 
      id: 'precious-beads-necklace', 
      label: 'Precious Beads Necklace',
      mobileLabel: 'Precious Beads',
      slug: 'precious-beads-necklace' 
    },
    { 
      id: 'semi-precious-beads-necklace', 
      label: 'Semi Precious Beads Necklace',
      mobileLabel: 'Semi Precious',
      slug: 'semi-precious-beads-necklace' 
    },
    { 
      id: 'diamond-jewelry', 
      label: 'Diamond Jewelry',
      mobileLabel: 'Diamonds',
      slug: 'diamond-jewelry' 
    }
  ];

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const fetchAllCategories = async () => {
    setLoading(true);
    
    try {
      const baseUrl = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
      
      const fetchPromises = categories.map(async (category) => {
        try {
          const response = await fetch(
            `${baseUrl}/products/category/${category.slug}?limit=4`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (!response.ok) {
            console.warn(`API returned ${response.status} for ${category.label}`);
            return { categoryId: category.id, products: [] };
          }
          
          const data = await response.json();
          
          let productsArray = [];
          if (Array.isArray(data)) {
            productsArray = data;
          } else if (data.products && Array.isArray(data.products)) {
            productsArray = data.products;
          } else if (data.data && Array.isArray(data.data)) {
            productsArray = data.data;
          }
          
          return { categoryId: category.id, products: productsArray };
        } catch (err) {
          console.error(`Error fetching ${category.label}:`, err);
          return { categoryId: category.id, products: [] };
        }
      });

      const results = await Promise.all(fetchPromises);
      const productsMap = {};
      results.forEach(({ categoryId, products }) => {
        productsMap[categoryId] = products.slice(0, 4);
      });
      
      setProducts(productsMap);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentProducts = products[activeTab] || [];

  const handleViewAll = () => {
    const slug = categories.find(c => c.id === activeTab)?.slug;
    window.location.href = `/products/category/${slug}`;
  };

  return (
    <>
      <style>{sectionStyles}</style>
      <section className="jewellery-section" style={{ backgroundColor: theme.categoriesBg }}>
        <div className="section-header">
          <div className="header-divider">
            <div className="divider-line left"></div>
            <span className="divider-icon">◆</span>
            <div className="divider-line right"></div>
          </div>
          <h2 className="section-title">Timeless Treasures</h2>
        </div>

        <div className="tabs-wrapper">
          <div className="tabs-container">
            {categories.map((category, index) => (
              <React.Fragment key={category.id}>
                <button
                  onClick={() => setActiveTab(category.id)}
                  className={`tab-button ${activeTab === category.id ? 'active' : ''}`}
                >
                  {isMobile ? category.mobileLabel : category.label}
                </button>
                {index < categories.length - 1 && (
                  <span className="tab-separator">•</span>
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="tabs-divider">
            <div className="tabs-divider-line left"></div>
            <span className="tabs-divider-icon">✦</span>
            <div className="tabs-divider-line right"></div>
          </div>
        </div>

        <div className="products-wrapper">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="empty-container">
              <p className="empty-text">No products available in this category</p>
            </div>
          ) : (
            <div className="products-grid">
              {currentProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  categorySlug={categories.find(c => c.id === activeTab)?.slug}
                />
              ))}
            </div>
          )}
        </div>

        {currentProducts.length > 0 && (
          <div className="view-all-container">
            <button onClick={handleViewAll} className="view-all-button">
              View All
            </button>
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

.jewellery-section {
  padding: clamp(1rem, 1vw, 5rem) clamp(1rem, 3vw, 2rem);
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.section-header {
  text-align: center;
  margin-bottom: clamp(2.5rem, 5vw, 3.5rem);
}

.header-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.5rem, 1.5vw, 1rem);
  margin-bottom: clamp(1rem, 2vw, 1.5rem);
}

.divider-line {
  height: 1px;
  width: clamp(2rem, 5vw, 3rem);
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

.section-title {
  font-size: clamp(2.5rem, 6vw, 5rem);
  letter-spacing: 0.05em;
  color: #6B5D4F;
  margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(107, 93, 79, 0.15), 0 1px 4px rgba(139, 115, 85, 0.1);
  line-height: 1.2;
  font-family:'sans-serif';
}

.section-subtitle {
  font-size: clamp(1rem, 1.75vw, 1.25rem);
  color: #8B7355;
  font-weight: 300;
  letter-spacing: 0.03em;
  font-style: italic;
  text-shadow: 0 1px 4px rgba(139, 115, 85, 0.1);
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.tabs-wrapper {
  margin-bottom: clamp(2rem, 4vw, 3rem);
}

.tabs-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(1rem, 3vw, 2rem);
  margin-bottom: clamp(1rem, 2vw, 1.5rem);
  flex-wrap: wrap;
  padding: 0 1rem;
}

.tab-button {
  font-size: clamp(0.875rem, 1.25vw, 1rem);
  letter-spacing: 0.03em;
  padding: clamp(0.5rem, 1vw, 0.75rem) 0;
  transition: all 0.3s ease;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #A0937D;
  position: relative;
  white-space: nowrap;
}

.tab-button.active {
  color: #8B7355;
  font-weight: 600;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #C9A557;
}

.tab-button:hover {
  color: #8B7355;
}

.tab-separator {
  color: #C9A557;
  font-size: clamp(0.75rem, 1vw, 0.875rem);
}

@media (max-width: 640px) {
  .tabs-container {
    gap: 0;
    padding: 0;
    justify-content: space-evenly;
  }
  
  .tab-button {
    font-size: clamp(0.875rem, 3.5vw, 1rem);
    padding: clamp(0.5rem, 2vw, 0.75rem) clamp(0.5rem, 2vw, 1rem);
    letter-spacing: 0.02em;
    flex: 1;
    text-align: center;
    max-width: 33.333%;
  }
  
  .tab-separator {
    display: none;
  }
}

.tabs-divider {
  display: flex;
  align-items: center;
  justify-center;
  gap: clamp(0.5rem, 1.5vw, 1rem);
  padding: 0 clamp(1rem, 3vw, 2rem);
}

.tabs-divider-line {
  flex: 1;
  height: 1px;
}

.tabs-divider-line.left {
  background: linear-gradient(to right, transparent, #C9A557);
}

.tabs-divider-line.right {
  background: linear-gradient(to left, transparent, #C9A557);
}

.tabs-divider-icon {
  color: #C9A557;
  font-size: clamp(1rem, 1.5vw, 1.25rem);
}

.products-wrapper {
  min-height: clamp(300px, 40vw, 450px);
  width: 100%;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(3rem, 6vw, 5rem) 0;
}

.spinner {
  width: clamp(2rem, 4vw, 2.5rem);
  height: clamp(2rem, 4vw, 2.5rem);
  border: 2px solid #C9A557;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-container {
  text-align: center;
  padding: clamp(3rem, 6vw, 5rem) 0;
}

.empty-text {
  color: #B5A898;
  font-size: clamp(0.875rem, 1.25vw, 1rem);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(1rem, 2.5vw, 1.5rem);
  width: 100%;
}

@media (min-width: 640px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.view-all-container {
  text-align: center;
  margin-top: clamp(2rem, 4vw, 3rem);
}

.view-all-button {
  color: #8B7355;
  font-size: clamp(0.875rem, 1.25vw, 1rem);
  letter-spacing: 0.03em;
  border: none;
  border-bottom: 1px solid #8B7355;
  background: transparent;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: all 0.3s ease;
}

.view-all-button:hover {
  color: #C9A557;
  border-bottom-color: #C9A557;
}
`;

const cardStyles = `
.product-card {
  cursor: pointer;
  width: 100%;
  transition: transform 0.3s ease;
}

.product-card:active {
  transform: scale(0.98);
}

.product-image-wrapper {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  border-radius: clamp(1rem, 2vw, 1.5rem);
  background: #f5f5f5;
  margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
}

.product-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.product-image.primary.hovered {
  transform: scale(1.05);
}

.product-image.secondary {
  opacity: 0;
}

.product-image.secondary.visible {
  opacity: 1;
}

.wishlist-button {
  position: absolute;
  top: clamp(0.5rem, 1.5vw, 0.75rem);
  right: clamp(0.5rem, 1.5vw, 0.75rem);
  width: clamp(2rem, 4vw, 2.25rem);
  height: clamp(2rem, 4vw, 2.25rem);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.wishlist-button:hover {
  background: rgba(255, 255, 255, 0.4);
}

.wishlist-button.active {
  background: rgba(255, 255, 255, 0.95);
}

.wishlist-icon {
  width: clamp(1rem, 2vw, 1.25rem);
  height: clamp(1rem, 2vw, 1.25rem);
  color: white;
  stroke-width: 2;
  transition: all 0.3s ease;
}

.wishlist-icon.filled {
  fill: #ef4444;
  color: #ef4444;
}

.out-of-stock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.out-of-stock-badge {
  background: white;
  padding: clamp(0.375rem, 1vw, 0.5rem) clamp(0.75rem, 2vw, 1rem);
  border-radius: 9999px;
  font-size: clamp(0.75rem, 1.25vw, 0.875rem);
  font-weight: 500;
  color: #1f2937;
}

.bestseller-wrapper {
  position: absolute;
  top: clamp(0.5rem, 1.5vw, 0.75rem);
  left: clamp(0.5rem, 1.5vw, 0.75rem);
  z-index: 10;
  position: relative;
}

.bestseller-glow {
  position: absolute;
  inset: 0;
  background: #C9A557;
  filter: blur(4px);
}

.bestseller-badge {
  position: relative;
  display: inline-block;
  background: linear-gradient(to right, #C9A557, #D4A055);
  color: white;
  padding: clamp(0.375rem, 1vw, 0.5rem) clamp(0.75rem, 2vw, 1rem);
  border-radius: 9999px;
  font-size: clamp(0.625rem, 1vw, 0.75rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.product-info {
  padding: 0 clamp(0.25rem, 0.5vw, 0.5rem);
}

.product-name {
  font-size: clamp(0.875rem, 1.25vw, 1rem);
  color: #6B5D4F;
  margin-bottom: clamp(0.375rem, 0.75vw, 0.5rem);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
  min-height: 2.8em;
}

.product-card:hover .product-name {
  color: #8B7355;
}

.product-pricing {
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 1vw, 0.5rem);
}

.price-current {
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  font-weight: 700;
  color: #8B7355;
}

.price-original {
  font-size: clamp(0.75rem, 1.25vw, 0.875rem);
  color: #B5A898;
  text-decoration: line-through;
  font-weight: 500;
}

@media (max-width: 640px) {
  .product-card:hover {
    transform: none;
  }
  
  .product-image.primary.hovered {
    transform: scale(1.02);
  }
}
`;

export default JewelleryCategoriesSection;  