import React, { useState, useEffect } from 'react';
import { useHomePageTheme } from '../../pages/HomePage';
import ProductCard from '../products/ProductCard'; // Adjust path as needed

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
          
          <h2 className="section-title text-[ #182c51]">Timeless Treasures</h2>
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
  background: linear-gradient(to right, transparent,  #182c51);
}

.divider-line.right {
  background: linear-gradient(to left, transparent,  #182c51);
}

.divider-icon {
  color:  #182c51;
  font-size: clamp(1rem, 1.5vw, 1.25rem);
}

.section-title {
  font-size: clamp(2.5rem, 6vw, 5rem);
  letter-spacing: 0.05em;
  color: #182c51;
  margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
  font-weight: 700;
  line-height: 1.2;
  font-family: 'sans-serif';
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
  color: #182c51;
  position: relative;
  white-space: nowrap;
  font-family: 'sans-serif';

}

.tab-button.active {
  color:  #182c51;
  font-weight: 600;
   font-family: 'sans-serif';
   border: none;
}

.tab-button.active::after {
  content: '.';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #0a0258ff;
   font-family: 'sans-serif';
}

.tab-button:hover {
  color:  #182c51;
  border:none;
}

.tab-separator {
  color:  #182c51;
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
    border:none;
  }
  
  .tab-separator {
    display: none;
  }
}

.tabs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.5rem, 1.5vw, 1rem);
  padding: 0 clamp(1rem, 3vw, 2rem);
}

.tabs-divider-line {
  flex: 1;
  height: 1px;
}

.tabs-divider-line.left {
  background: linear-gradient(to right, transparent,  #182c51);
}

.tabs-divider-line.right {
  background: linear-gradient(to left, transparent,  #182c51);
}

.tabs-divider-icon {
  color:  #182c51 ;
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
  border: 2px solid  #182c51;
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
  color: #182c51;
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
  color:  #182c51;
  font-size: clamp(0.875rem, 1.25vw, 1rem);
  letter-spacing: 0.03em;
  border: none;
  border-bottom: 1px solid  #182c51;
  background: transparent;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: all 0.3s ease;
}

.view-all-button:hover {
  color: #182c51;
  border-bottom-color:  #182c51;
}

h2.section-title{
  color:#10254b;
}
  
`;

export default JewelleryCategoriesSection;