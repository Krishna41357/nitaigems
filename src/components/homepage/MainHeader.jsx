import React, { useState, useEffect, useRef } from 'react';
import { Heart, User, ShoppingCart, Search, Menu, ChevronRight, X } from 'lucide-react';
import { useCart, useWishlist } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import UserLoginModal from '../../components/auth/UserLoginModal';
import { useNavigate, useLocation } from 'react-router-dom';

const MainHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const logoUrl = 'https://res.cloudinary.com/dxoxbnptl/image/upload/v1765111345/logo_vbpjqx.png' ;
  // Navigation states
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [subcategories, setSubcategories] = useState({});
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dropdownRef = useRef(null);
  const megaMenuRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const MAX_MAIN_CATEGORIES = 7;
  const API_BASE = import.meta.env.VITE_APP_BASE_URL;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setCategories([]);
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
      setSubcategories(prev => ({
        ...prev,
        [categorySlug]: []
      }));
    }
  };

  const handleCategoryHover = (category) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredCategory(category);
    if (category) fetchSubcategories(category.slug);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setHoveredCategory(null), 200);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
      setShowMobileSearch(false);
    }
  };

  const handleNavigation = (path) => {
    if (path === '/cart') {
      navigate('/cart', { state: { from: location.pathname } });
      return;
    }

    if (path.startsWith('/category/')) {
      navigate(`/products${path}`);
    } else {
      navigate(path);
    }
    
    setHoveredCategory(null);
    setShowMobileSidebar(false);
  };

  const handleUserAction = (action) => {
    setShowUserDropdown(false);

    switch (action) {
      case 'account':
        handleNavigation('/account');
        break;
      case 'orders':
        handleNavigation('/orders');
        break;
      case 'logout':
        logout();
        handleNavigation('/');
        break;
      case 'login':
        setShowLoginModal(true);
        break;
      case 'signup':
        handleNavigation('/signup');
        break;
      default:
        break;
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

  const iconColor = "#b8860b";
  const headerFont = "'Cinzel', 'Playfair Display', serif";

  return (
    <>
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-50">
        {/* Main Header */}
        <header
          style={{ fontFamily: headerFont }}
          className={`bg-[#fbf6ef] border-b border-transparent transition-shadow duration-200 ${
            isScrolled ? 'shadow-md' : ''
          }`}
        >
          {/* Desktop Header */}
          <div className="hidden md:block w-full max-w-full px-3 lg:px-4">
            <div className="flex items-center justify-between h-14 lg:h-20 gap-2 lg:gap-4">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0">
                <button
                  onClick={() => handleNavigation('/')}
                  className="p-0 m-0 border-none bg-transparent"
                  aria-label="Home"
                >
                  <img src={logoUrl} alt="Logo" className="h-12 lg:h-16 w-auto object-contain" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex-1 flex justify-center mx-2 lg:mx-4 max-w-2xl">
                <div className="relative w-full">
                  <div className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Search size={16} color={iconColor} strokeWidth={1.5} className="lg:w-[18px] lg:h-[18px]" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    placeholder="Search for jewellery, collections..."
                    className="w-full pl-9 lg:pl-12 pr-3 lg:pr-4 py-1.5 lg:py-2.5 bg-white/95 border border-[#efe6d9] rounded-full focus:outline-none focus:ring-2 focus:ring-[#e9d6a1] focus:border-[#d4a055] text-xs lg:text-sm text-[#3b1b12] placeholder-[#a88a60] shadow-sm"
                  />
                </div>
              </div>

              {/* Icons */}
              <div className="flex items-center gap-1.5 lg:gap-3 flex-shrink-0">
                <button onClick={() => handleNavigation('/wishlist')} className="p-1.5 lg:p-2 bg-transparent relative group hover:scale-105 transition-transform" aria-label="Wishlist">
                  <Heart size={18} color={iconColor} strokeWidth={1.5} className="lg:w-5 lg:h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 lg:-top-1 -right-0.5 lg:-right-1 bg-red-600 text-white text-[10px] lg:text-xs w-3.5 h-3.5 lg:w-4 lg:h-4 flex items-center justify-center rounded-full font-medium">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="p-1.5 lg:p-2 bg-transparent relative group hover:scale-105 transition-transform" aria-label="Account">
                    <User size={18} color={iconColor} strokeWidth={1.5} className="lg:w-5 lg:h-5" />
                  </button>
                </div>

                <button onClick={() => handleNavigation('/cart')} className="p-1.5 lg:p-2 bg-transparent relative group hover:scale-105 transition-transform" aria-label="Cart">
                  <ShoppingCart size={19} color={iconColor} strokeWidth={1.5} className="lg:w-[22px] lg:h-[22px]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 lg:-top-1 -right-0.5 lg:-right-1 bg-red-600 text-white text-[10px] lg:text-xs w-3.5 h-3.5 lg:w-4 lg:h-4 flex items-center justify-center rounded-full font-medium">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden w-full max-w-full px-3">
            <div className="flex items-center justify-between h-14 gap-2">
              <button onClick={() => setShowMobileSidebar(true)} className="p-1.5 bg-transparent hover:bg-[#E8DEC9] rounded-lg transition-colors" aria-label="Menu">
                <Menu size={20} color={iconColor} strokeWidth={1.5} />
              </button>

              <button onClick={() => handleNavigation('/')} className="p-0 m-0 border-none w-20 bg-transparent" aria-label="Home">
                <img src={logoUrl} alt="Logo" className="h-10 w-20 object-cover" />
              </button>

              <div className="flex items-center gap-1.5">
                <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="p-1.5 bg-transparent hover:bg-[#E8DEC9] rounded-lg transition-colors" aria-label="Search">
                  <Search size={18} color={iconColor} strokeWidth={1.5} />
                </button>
                <button onClick={() => handleNavigation('/wishlist')} className="p-1.5 bg-transparent relative hover:bg-[#E8DEC9] rounded-lg transition-colors" aria-label="Wishlist">
                  <Heart size={18} color={iconColor} strokeWidth={1.5} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-medium">{wishlistCount}</span>
                  )}
                </button>
                <button onClick={() => handleNavigation('/cart')} className="p-1.5 bg-transparent relative hover:bg-[#E8DEC9] rounded-lg transition-colors" aria-label="Cart">
                  <ShoppingCart size={19} color={iconColor} strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-medium">{cartCount > 9 ? '9+' : cartCount}</span>
                  )}
                </button>
              </div>
            </div>

            {showMobileSearch && (
              <div className="pb-3 pt-1 animate-fadeIn">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Search size={16} color={iconColor} strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    placeholder="Search for jewellery..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#efe6d9] rounded-full focus:outline-none focus:ring-2 focus:ring-[#e9d6a1] text-sm text-[#3b1b12] placeholder-[#a88a60]"
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Desktop Navigation */}
        <nav style={{ fontFamily: headerFont }} className="hidden md:block bg-[#E8DEC9] border-b border-[#D4C5B0] shadow-sm">
          <div className="w-full flex justify-center pt-1">
            <span className="text-[#CFAF68] text-lg lg:text-xl" aria-hidden>✦</span>
          </div>
          <div className="w-full max-w-full px-2 lg:px-4">
            <div className="flex items-center justify-center gap-3 lg:gap-6 h-12 lg:h-14 py-1">
              {!loading && mainCategories.map((category) => (
                <div key={category.id} className="relative" onMouseEnter={() => handleCategoryHover(category)} onMouseLeave={handleMouseLeave}>
                  <button
                    onClick={() => handleNavigation(`/category/${category.slug}`)}
                    className="text-[#5A4638] bg-transparent font-semibold text-xs lg:text-sm tracking-wide transition-all hover:text-[#8A6B52] hover:scale-105 py-2 px-1.5 lg:px-2 group whitespace-nowrap"
                  >
                    <span style={{ textShadow: '0 0 20px rgba(255, 250, 240, 0.6)' }}>{category.name}</span>
                    <span className="absolute bottom-2 left-1/2 w-0 h-0.5 bg-[#CFAF68] transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                  </button>
                </div>
              ))}

              {moreCategories.length > 0 && (
                <div className="relative group">
                  <button className="text-[#5A4638] font-semibold text-xs lg:text-sm transition-all relative py-2 px-1.5 lg:px-2 hover:text-[#8A6B52] whitespace-nowrap">
                    <span style={{ textShadow: '0 0 20px rgba(255, 250, 240, 0.6)' }}>More</span>
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
      </div>
      {/* User Dropdown */}
      {showUserDropdown && (
        <div style={{ position: 'fixed', right: '1rem', top: '5rem', zIndex: 100 }} className="w-44 lg:w-48 bg-white border border-[#efe6d9] rounded-lg shadow-lg py-2 animate-fadeIn">
          {isAuthenticated ? (
            <>
              {user && (
                <div className="px-3 lg:px-4 py-2 border-b border-gray-200">
                  <p className="text-xs lg:text-sm font-medium text-gray-900 truncate">{user.name || user.email}</p>
                </div>
              )}
              <button onClick={() => handleUserAction('account')} className="w-full text-left px-3 lg:px-4 py-2 hover:bg-gray-50 text-xs lg:text-sm transition-colors">My Account</button>
              <button onClick={() => handleUserAction('orders')} className="w-full text-left px-3 lg:px-4 py-2 hover:bg-gray-50 text-xs lg:text-sm transition-colors">My Orders</button>
              <button onClick={() => handleUserAction('logout')} className="w-full text-left px-3 lg:px-4 py-2 bg-red-100 hover:bg-[#fff4ee] text-xs lg:text-sm text-red-600 transition-colors">Sign Out</button>
            </>
          ) : (
            <button onClick={() => handleUserAction('login')} className="w-full text-left px-3 lg:px-4 py-2 hover:bg-gray-50 text-xs lg:text-sm transition-colors">Login</button>
          )}
        </div>
      )}

      {/* Mega Menu */}
      {hoveredCategory && (
        <div
          ref={megaMenuRef}
          onMouseEnter={() => handleCategoryHover(hoveredCategory)}
          onMouseLeave={handleMouseLeave}
          style={{ position: 'fixed', left: 0, right: 0, top: 'calc(5rem + 3.5rem)', zIndex: 90 }}
          className="hidden md:block bg-white border-t-2 border-[#CFAF68] shadow-lg animate-fadeIn rounded-b-xl"
        >
          <div className="w-full max-w-full px-2 lg:px-4 py-4 lg:py-8">
            <div className="flex gap-4 lg:gap-8">
              <div className="w-48 lg:w-64 flex-shrink-0">
                <div className="space-y-3 lg:space-y-4">
                  <button className="w-full text-left px-3 lg:px-4 py-2 lg:py-3 bg-[#E8DEC9] text-[#5A4638] font-medium rounded-lg shadow-sm text-xs lg:text-sm">Category</button>
                  <button className="w-full text-left px-3 lg:px-4 py-2 lg:py-3 bg-transparent text-[#5A4638] hover:bg-[#F4EFE6] rounded-lg transition-colors text-xs lg:text-sm">Price</button>
                  <button className="w-full text-left px-3 lg:px-4 py-2 lg:py-3 bg-transparent text-[#5A4638] hover:bg-[#F4EFE6] rounded-lg transition-colors text-xs lg:text-sm">Gender</button>
                  <button className="w-full text-left px-3 lg:px-4 py-2 lg:py-3 bg-transparent text-[#5A4638] hover:bg-[#F4EFE6] rounded-lg transition-colors text-xs lg:text-sm">Metal & Stones</button>
                </div>
              </div>

              <div className="flex-1 flex gap-4 lg:gap-6">
                <div className="flex-1">
                  <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3 max-h-[300px] lg:max-h-[400px] overflow-y-auto pr-2 heritage-scroll">
                    {subcategories[hoveredCategory.slug]?.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => handleNavigation(`/category/${hoveredCategory.slug}/${subcategory.slug}`)}
                        className="flex items-center gap-2 p-1.5 lg:p-2 bg-white hover:shadow-md hover:border-[#CFAF68] rounded-lg transition-all group text-left"
                      >
                        {subcategory.image ? (
                          <img
                            src={subcategory.image}
                            alt={subcategory.name}
                            className="w-8 h-8 lg:w-10 lg:h-10 object-cover rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#E8DEC9] rounded-full flex-shrink-0 flex items-center justify-center text-[10px] lg:text-xs text-[#8A6B52] font-semibold">
                            {subcategory.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[10px] lg:text-xs text-[#5A4638] group-hover:text-[#8A6B52] transition-colors truncate">{subcategory.name}</h3>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-48 lg:w-64 flex-shrink-0">
                  <div className="bg-[#FFFAF3] rounded-lg p-3 lg:p-4 border border-[#E8DEC9] h-full flex flex-col justify-between">
                    <div>
                      <div className="flex gap-1.5 lg:gap-2 mb-2 lg:mb-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-12 h-12 lg:w-16 lg:h-16 bg-[#E8DEC9] rounded-lg"></div>
                        ))}
                      </div>
                      <h3 className="text-xs lg:text-sm font-semibold text-[#5A4638] mb-1.5 lg:mb-2 leading-tight">
                        {hoveredCategory.name} for You — Crafted with Precision
                      </h3>
                      <p className="text-[10px] lg:text-xs text-[#8A6B52]">Explore 3500+ Stunning Styles</p>
                    </div>
                    <button
                      onClick={() => handleNavigation(`/category/${hoveredCategory.slug}`)}
                      className="w-full bg-gradient-to-r from-[#CFAF68] to-[#D4A055] text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium hover:from-[#B8860B] hover:to-[#CFAF68] transition-colors shadow-md mt-2 lg:mt-3"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setShowMobileSidebar(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-xs bg-white z-50 overflow-y-auto md:hidden animate-slideIn shadow-xl">
            <div className="sticky top-0 bg-[#E8DEC9] border-b border-[#D4C5B0] px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-serif font-semibold text-[#5A4638]">Categories</h2>
              <button onClick={() => setShowMobileSidebar(false)} className="p-1.5 sm:p-2 hover:bg-[#D4C5B0] bg-transparent rounded-lg transition-colors">
                <X size={20} className="text-[#5A4638]" />
              </button>
            </div>

            <div className="py-2">
              {categories.map((category) => (
                <div key={category.id} className="border-b border-[#E8DEC9]">
                  <button
                    onClick={() => toggleMobileCategory(category.slug)}
                    className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent "
                  >
                    <span className="font-medium text-sm sm:text-base text-[#5A4638]">{category.name}</span>
                    <ChevronRight size={18} className={`transition-transform text-[#8A6B52] ${expandedMobileCategory === category.slug ? 'rotate-90' : ''}`} />
                  </button>

                  {expandedMobileCategory === category.slug && (
                    <div className="bg-[#F4EFE6] py-2 mt-2">
                      <button
                        onClick={() => {
                          handleNavigation(`/category/${category.slug}`);
                          setShowMobileSidebar(false);
                        }}
                        className="w-full text-left px-6 sm:px-8 py-2 text-[#8A6B52] font-medium bg-transparent text-sm"
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
                          className="w-full text-left px-6 sm:px-8 py-2 hover:bg-[#E8DEC9] bg-transparent text-xs sm:text-sm text-[#5A4638] transition-colors"
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

      {/* User Login Modal */}
      <UserLoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        
        .heritage-scroll::-webkit-scrollbar { width: 8px; }
        .heritage-scroll::-webkit-scrollbar-track { background: #f6f1e7; }
        .heritage-scroll::-webkit-scrollbar-thumb { background: #b59a72; border-radius: 4px; }
        .heritage-scroll::-webkit-scrollbar-thumb:hover { background: #8d744e; }
      `}</style>
    </>
  );
};

export default MainHeader;