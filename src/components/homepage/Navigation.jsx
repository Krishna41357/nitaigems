import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const megaMenuRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_APP_BASE_URL;
  const MAX_MAIN_CATEGORIES = 7;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categorySlug) => {
    if (subcategories[categorySlug]) return;

    try {
      const response = await fetch(`${API_BASE}/subcategories/category/${categorySlug}`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      const data = await response.json();
      setSubcategories(prev => ({
        ...prev,
        [categorySlug]: data || []
      }));
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  const handleCategoryHover = (category) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    setHoveredCategory(category);
    if (category) {
      fetchSubcategories(category.slug);
    }
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  };

  const handleNavigation = (path) => {
    if (path.startsWith('/category/')) {
      navigate(`/products${path}`);
    } else {
      navigate(path);
    }
  };

  const toggleMobileCategory = (categorySlug) => {
    if (expandedMobileCategory === categorySlug) {
      setExpandedMobileCategory(null);
    } else {
      setExpandedMobileCategory(categorySlug);
      fetchSubcategories(categorySlug);
    }
  };

  const mainCategories = categories.slice(0, MAX_MAIN_CATEGORIES);
  const moreCategories = categories.slice(MAX_MAIN_CATEGORIES);

  if (loading) {
    return (
      <nav className="bg-[#E8DEC9] border-b border-[#D4C5B0] sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 h-14">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 w-20 bg-[#D4C5B0] rounded animate-pulse" />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  if (error) {
    return (
      <nav className="bg-[#E8DEC9] border-b border-[#D4C5B0] sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <p className="text-red-700 mb-2">Failed to load categories</p>
            <button
              onClick={fetchCategories}
              className="text-sm text-[#8A6B52] hover:underline font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Desktop Navigation - Champagne Gold Theme */}
      <nav 
        style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }} 
        className="hidden md:block bg-[#E8DEC9] sticky top-0 border-b border-[#D4C5B0] z-40 shadow-sm"
      >
        <div className="w-full flex justify-center pt-1">
          <span className="text-[#CFAF68] text-xl" aria-hidden>✦</span>
        </div>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 h-14 py-1">
            {mainCategories.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => handleCategoryHover(category)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => handleNavigation(`/category/${category.slug}`)}
                  className="text-[#5A4638] bg-transparent hover:border-none font-semibold text-sm tracking-wide transition-all hover:text-[#8A6B52] hover:scale-105 transform-gpu relative py-2 px-2 group whitespace-nowrap"
                >
                  <span style={{ textShadow: '0 0 20px rgba(255, 250, 240, 0.6), 0 0 10px rgba(244, 239, 230, 0.4)' }}>
                    {category.name}
                  </span>
                  <span className="absolute bottom-2 left-1/2 w-0 h-0.5 bg-[#CFAF68] transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                </button>
              </div>
            ))}

            {moreCategories.length > 0 && (
              <div className="relative group">
                <button className="text-[#5A4638] font-medium text-sm transition-all relative py-2 px-2 hover:text-[#8A6B52] whitespace-nowrap">
                  <span style={{ textShadow: '0 0 20px rgba(255, 250, 240, 0.6), 0 0 10px rgba(244, 239, 230, 0.4)' }}>
                    More
                  </span>
                  <span className="absolute bottom-2 left-1/2 w-0 h-0.5 bg-[#CFAF68] transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                </button>
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-[#D4C5B0] rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                  {moreCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleNavigation(`/category/${category.slug}`)}
                      className="w-full text-left px-4 py-2 hover:bg-[#E8DEC9] text-sm text-[#5A4638] transition-colors"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mega Menu - Outside nav to avoid overflow restrictions */}
      {hoveredCategory && (
        <div
          ref={megaMenuRef}
          onMouseEnter={() => handleCategoryHover(hoveredCategory)}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '3%',
            zIndex: 100,
            maxWidth: '100vw',
            width: '100%'
          }}
          className="hidden md:block bg-white border-t-2 border-[#CFAF68] shadow-lg animate-fadeIn rounded-b-xl"
        >
          <div className="container mx-auto px-4 py-8">
            <div className="flex gap-8">
              {/* Left Sidebar */}
              <div className="w-64 flex-shrink-0">
                <div className="space-y-4">
                  <button className="w-full text-left px-4 py-3 bg-[#E8DEC9] text-[#5A4638] font-medium rounded-lg shadow-sm">
                    Category
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-transparent text-[#5A4638] hover:bg-[#F4EFE6] rounded-lg transition-colors">
                    Price
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-transparent text-[#5A4638] hover:bg-[#F4EFE6] rounded-lg transition-colors">
                    Gender
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-transparent text-[#5A4638] hover:bg-[#F4EFE6] rounded-lg transition-colors">
                    Metal & Stones
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex gap-6">
                {/* Subcategories Grid */}
                <div className="flex-1">
                  <div className="grid grid-cols-4 gap-3 max-h-[400px]  overflow-y-auto pr-2 heritage-scroll">
                    {subcategories[hoveredCategory.slug]?.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => handleNavigation(`/category/${hoveredCategory.slug}/${subcategory.slug}`)}
                        className="flex items-center gap-2 p-2 bg-white border-none hover:shadow-md hover:border-[#CFAF68] rounded-lg transition-all group text-left"
                      >
                        {subcategory.image ? (
                          <img
                            src={subcategory.image}
                            alt={subcategory.name}
                            className="w-10 h-10 object-cover rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-[#E8DEC9] rounded-full flex-shrink-0 flex items-center justify-center text-xs text-[#8A6B52] font-semibold">
                            {subcategory.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-xs text-[#5A4638] group-hover:text-[#8A6B52] transition-colors truncate">
                            {subcategory.name}
                          </h3>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banner - Right Side */}
                <div className="w-64 flex-shrink-0">
                  <div className="bg-[#FFFAF3] rounded-lg p-4 border border-[#E8DEC9] h-full flex flex-col justify-between">
                    <div>
                      <div className="flex gap-2 mb-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-16 h-16 bg-[#E8DEC9] rounded-lg"></div>
                        ))}
                      </div>
                      <h3 className="text-sm font-semibold text-[#5A4638] mb-2 leading-tight">
                        {hoveredCategory.name} for You — Crafted with Precision, Designed for Elegance.
                      </h3>
                      <p className="text-xs text-[#8A6B52]">Explore 3500+ Stunning Styles.</p>
                    </div>
                    <button
                      onClick={() => handleNavigation(`/category/${hoveredCategory.slug}`)}
                      className="w-full bg-gradient-to-r from-[#CFAF68] to-[#D4A055] text-white px-4 py-2 rounded-full text-sm font-medium hover:from-[#B8860B] hover:to-[#CFAF68] transition-colors shadow-md mt-3"
                      style={{letterSpacing: '0.6px'}}
                    >
                      View All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {showMobileSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto md:hidden animate-slideIn shadow-xl">
            <div className="sticky top-0 bg-[#E8DEC9] border-b border-[#D4C5B0] px-4 py-4 flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold text-[#5A4638]">Categories</h2>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-2 hover:bg-[#D4C5B0] rounded-lg transition-colors"
              >
                <X size={24} className="text-[#5A4638]" />
              </button>
            </div>

            <div className="py-2">
              {categories.map((category) => (
                <div key={category.id} className="border-b border-[#E8DEC9]">
                  <button
                    onClick={() => toggleMobileCategory(category.slug)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F4EFE6] transition-colors"
                  >
                    <span className="font-medium text-[#5A4638]">{category.name}</span>
                    <ChevronRight
                      size={20}
                      className={`transition-transform text-[#8A6B52] ${
                        expandedMobileCategory === category.slug ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {expandedMobileCategory === category.slug && (
                    <div className="bg-[#F4EFE6] py-2">
                      <button
                        onClick={() => {
                          handleNavigation(`/category/${category.slug}`);
                          setShowMobileSidebar(false);
                        }}
                        className="w-full text-left px-8 py-2 text-[#8A6B52] font-medium hover:bg-[#E8DEC9] transition-colors"
                      >
                        View All {category.name}
                      </button>
                      {subcategories[category.slug]?.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          onClick={() => {
                            handleNavigation(`/category/${category.slug}/${subcategory.slug}`);
                            setShowMobileSidebar(false);
                          }}
                          className="w-full text-left px-8 py-2 hover:bg-[#E8DEC9] text-sm text-[#5A4638] transition-colors"
                        >
                          {subcategory.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        :root {
          --nav-height: 120px;
        }
      `}</style>
    </>
  );
};

export default Navigation;