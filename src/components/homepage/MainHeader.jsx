import React, { useState, useEffect, useRef } from 'react';
import { Heart, User, ShoppingCart, Search, Menu, ChevronRight, X } from 'lucide-react';
import { useCart, useWishlist } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import UserLoginModal from '../../components/auth/UserLoginModal';
import { useNavigate, useLocation } from 'react-router-dom';

const MainHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const logoUrl = 'https://res.cloudinary.com/dxoxbnptl/image/upload/v1766477941/IMG_1805.1_fktwx7.png';
  
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

  // Enhanced scroll handler with navigation hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setShowNav(true);
        setIsScrolled(false);
      } else {
        setIsScrolled(true);
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setShowNav(false);
        } else if (currentScrollY < lastScrollY) {
          setShowNav(true);
        }
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    
    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  // Fetch categories on mount
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
    const protectedRoutes = ['/account', '/orders', '/wishlist', '/cart'];
    
    if (protectedRoutes.includes(path) && !isAuthenticated) {
      setShowLoginModal(true);
      setHoveredCategory(null);
      setShowMobileSidebar(false);
      return;
    }

    if (path === '/cart') {
      navigate('/cart', { state: { from: location.pathname } });
      setHoveredCategory(null);
      setShowMobileSidebar(false);
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
        if (!isAuthenticated) {
          setShowLoginModal(true);
          return;
        }
        handleNavigation('/account');
        break;
        
      case 'orders':
        if (!isAuthenticated) {
          setShowLoginModal(true);
          return;
        }
        handleNavigation('/orders');
        break;
        
      case 'logout':
        logout();
        navigate('/');
        break;
        
      case 'login':
        setShowLoginModal(true);
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

  const iconColor = "#10254b";
  const headerFont = "'Cinzel', 'Playfair Display', serif";

  return (
    <>
      {/* Sticky Header Container */}
      <div className="top-0 z-50">
        {/* Main Header */}
        <header
          style={{ fontFamily: headerFont }}
          className={`bg-white border-b border-gray-200 transition-shadow duration-200 ${
            isScrolled ? 'shadow-md' : ''
          }`}
        >
          {/* Desktop Header */}
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
                    className="w-full pl-9 lg:pl-12 pr-3 lg:pr-4 py-1.5 lg:py-2.5 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#10254b] focus:border-[#10254b] text-xs lg:text-sm text-gray-900 placeholder-gray-500 shadow-sm"
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
                  <button
                    onClick={() => setShowUserDropdown(v => !v)}
                    className="p-1.5 lg:p-2 bg-transparent relative group hover:scale-105 transition-transform"
                    aria-label="Account"
                  >
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
              <button onClick={() => setShowMobileSidebar(true)} className="p-1.5 bg-transparent hover:bg-gray-100 rounded-lg transition-colors" aria-label="Men">
                <Menu size={20} color={iconColor} strokeWidth={1.5} />
              </button>

              <button onClick={() => handleNavigation('/')} className="p-0 m-0 border-none w-20 bg-transparent" aria-label="Home">
                <img src={logoUrl} alt="Logo" className="h-10 w-20 object-cover" />
              </button>

              <div className="flex items-center gap-1.5">
                <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="p-1.5 bg-transparent hover:bg-gray-100 rounded-lg transition-colors" aria-label="Search">
                  <Search size={18} color={iconColor} strokeWidth={1.5} />
                </button>
                <button onClick={() => handleNavigation('/wishlist')} className="p-1.5 bg-transparent relative hover:bg-gray-100 rounded-lg transition-colors" aria-label="Wishlist">
                  <Heart size={18} color={iconColor} strokeWidth={1.5} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-medium">{wishlistCount}</span>
                  )}
                </button>
                <button
                  onClick={() => setShowUserDropdown(v => !v)}
                  className="p-1.5 bg-transparent hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Account"
                >
                  <User size={18} color={iconColor} strokeWidth={1.5} />
                </button>
                <button onClick={() => handleNavigation('/cart')} className="p-1.5 bg-transparent relative hover:bg-gray-100 rounded-lg transition-colors" aria-label="Cart">
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
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#10254b] text-sm text-gray-900 placeholder-gray-500"
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Desktop Navigation - Smaller height with slide animation */}
        <nav 
          style={{ fontFamily: headerFont }} 
          className={`hidden md:block bg-[#ffffff] border-b border-[#0d1d3a] shadow-sm transition-all duration-300 ease-in-out ${
            showNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
        >
          <div className="w-full flex justify-center pt-0.5">
            <span className="text-[#10254b] text-base lg:text-lg" aria-hidden>✦</span>
          </div>
          <div className="w-full max-w-full px-2 lg:px-4">
            <div className="flex items-center justify-center gap-3 lg:gap-6 h-9 lg:h-11 py-0.5">
              {!loading && mainCategories.map((category) => (
                <div key={category.id} className="relative" onMouseEnter={() => handleCategoryHover(category)} onMouseLeave={handleMouseLeave}>
                  <button
                    onClick={() => handleNavigation(`/category/${category.slug}`)}
                    className="text-[#10254b] bg-transparent font-semibold text-xs lg:text-sm tracking-wide transition-all text-[#10254b] hover:border-none hover:scale-105 py-1.5 px-1.5 lg:px-2 group whitespace-nowrap"
                  >
                    <span>{category.name}</span>
                    <span className="absolute bottom-1 left-1/2 w-0 h-0.5 bg-[#4a7fb8] transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                  </button>
                </div>
              ))}

              {moreCategories.length > 0 && (
                <div className="relative group">
                  <button className="text-white font-semibold text-xs lg:text-sm transition-all relative py-1.5 px-1.5 lg:px-2 hover:text-[#4a7fb8] whitespace-nowrap">
                    <span>More</span>
                    <span className="absolute bottom-1 left-1/2 w-0 h-0.5 bg-[#4a7fb8] transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                    {moreCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleNavigation(`/category/${category.slug}`)}
                        className="w-full text-left px-4 py-2 hover:bg-[#10254b] hover:text-white text-sm text-gray-900 transition-colors"
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
        <>
          <div 
            className="fixed inset-0 z-[55]" 
            onClick={() => setShowUserDropdown(false)}
          />
          
          <div 
            ref={dropdownRef}
            className="fixed right-4 top-16 lg:top-[5.5rem] z-[100] w-44 lg:w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-2"
            style={{ pointerEvents: 'all' }}
          >
            {isAuthenticated ? (
              <>
                {user && (
                  <div className="px-3 lg:px-4 py-2 border-b border-gray-200">
                    <p className="text-xs lg:text-sm font-medium text-gray-900 truncate">
                      {user.name || user.email}
                    </p>
                  </div>
                )}
                <button 
                  onClick={() => handleUserAction('account')} 
                  className="w-full text-left px-3 lg:px-4 py-2 hover:bg-gray-50 text-xs lg:text-sm transition-colors bg-transparent text-gray-900"
                >
                  My Account
                </button>
                <button 
                  onClick={() => handleUserAction('orders')} 
                  className="w-full text-left px-3 lg:px-4 py-2 hover:bg-gray-50 text-xs lg:text-sm transition-colors bg-transparent text-gray-900"
                >
                  My Orders
                </button>
                <button 
                  onClick={() => handleUserAction('logout')} 
                  className="w-full text-left px-3 lg:px-4 py-2 hover:bg-red-50 text-xs lg:text-sm text-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleUserAction('login')} 
                  className="w-full text-left px-3 lg:px-4 py-2 hover:bg-gray-50 text-xs lg:text-sm transition-colors bg-transparent text-gray-900"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Mega Menu */}
      {hoveredCategory && (
        <div
          ref={megaMenuRef}
          onMouseEnter={() => handleCategoryHover(hoveredCategory)}
          onMouseLeave={handleMouseLeave}
          style={{ position: 'fixed', left: 0, right: 0, top: 'calc(5rem + 4rem)', zIndex: 90 }}
          className="hidden md:block bg-white border-t-2 border-[#10254b] shadow-lg animate-fadeIn rounded-b-xl"
        >
          <div className="w-full max-w-full px-2 lg:px-4 py-4 lg:py-8">
            <div className="flex gap-4 lg:gap-8">
              <div className="w-48 lg:w-64 flex-shrink-0">
                <div className="space-y-3 lg:space-y-4">
                  <button className="w-full text-left px-3 lg:px-4 py-2 lg:py-3 bg-[#10254b] text-white font-medium rounded-lg shadow-sm text-xs lg:text-sm">Category</button>
                  <button className="w-full text-left px-3 lg:px-4 py-2 lg:py-3 bg-transparent text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-xs lg:text-sm">Price</button>
                  <button className="w-full text-left px-3 lg:px-4 py-2 lg:py-3 bg-transparent text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-xs lg:text-sm">Gender</button>
                  <button className="w-full text-left px-3 lg:px-4 py-2 lg:py-3 bg-transparent text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-xs lg:text-sm">Metal & Stones</button>
                </div>
              </div>

              <div className="flex-1 flex gap-4 lg:gap-6">
                <div className="flex-1">
                  <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3 max-h-[300px] lg:max-h-[400px] overflow-y-auto pr-2 heritage-scroll">
                    {subcategories[hoveredCategory.slug]?.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => handleNavigation(`/category/${hoveredCategory.slug}/${subcategory.slug}`)}
                        className="flex items-center gap-2 p-1.5 lg:p-2 bg-white hover:shadow-md hover:border-[#10254b] border border-transparent rounded-lg transition-all group text-left"
                      >
                        {subcategory.image ? (
                          <img
                            src={subcategory.image}
                            alt={subcategory.name}
                            className="w-8 h-8 lg:w-10 lg:h-10 object-cover rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#10254b] rounded-full flex-shrink-0 flex items-center justify-center text-[10px] lg:text-xs text-white font-semibold">
                            {subcategory.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[10px] lg:text-xs text-gray-900 group-hover:text-[#10254b] transition-colors truncate">{subcategory.name}</h3>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-48 lg:w-64 flex-shrink-0">
                  <div className="bg-[#f0f4f8] rounded-lg p-3 lg:p-4 border border-gray-200 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex gap-1.5 lg:gap-2 mb-2 lg:mb-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-12 h-12 lg:w-16 lg:h-16 bg-[#10254b] opacity-20 rounded-lg"></div>
                        ))}
                      </div>
                      <h3 className="text-xs lg:text-sm font-semibold text-gray-900 mb-1.5 lg:mb-2 leading-tight">
                        {hoveredCategory.name} for You — Crafted with Precision
                      </h3>
                      <p className="text-[10px] lg:text-xs text-gray-600">Explore 3500+ Stunning Styles</p>
                    </div>
                    <button
                      onClick={() => handleNavigation(`/category/${hoveredCategory.slug}`)}
                      className="w-full bg-[#10254b] text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium hover:bg-[#0d1d3a] transition-colors shadow-md mt-2 lg:mt-3"
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
          <div className="fixed inset-0 z-50 md:hidden" onClick={() => setShowMobileSidebar(false)} />
          <div className="fixed left-0 top-14 bottom-0 w-[100vw] max-w-xs bg-white z-50 overflow-y-auto md:hidden animate-slideIn shadow-xl">
            <div className="py-2">
              {categories.map((category) => (
                <div key={category.id} className=" py-1 border-gray-200">
                  <button
                    onClick={() => toggleMobileCategory(category.slug)}
                    className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent"
                  >
                    <span className="font-medium text-sm sm:text-base text-gray-900">{category.name}</span>
                    <ChevronRight size={18} className={`transition-transform text-[#10254b] ${expandedMobileCategory === category.slug ? 'rotate-90' : ''}`} />
                  </button>

                  {expandedMobileCategory === category.slug && (
                    <div className="bg-[#f0f4f8] py-2 mt-2">
                      <button
                        onClick={() => {
                          handleNavigation(`/category/${category.slug}`);
                          setShowMobileSidebar(false);
                        }}
                        className="w-full text-left px-6 sm:px-8 py-2 text-[#10254b] font-medium bg-transparent text-sm"
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
                          className="w-full text-left px-6 sm:px-8 py-2 hover:bg-gray-100 bg-transparent text-xs sm:text-sm text-gray-700 transition-colors"
                        >
                          {subcategory.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-10 border-b border-gray-200 px-3 w-44 sm:px-4 py-3">
              {isAuthenticated ? (
                <>
                 
                  <button
                    onClick={() => handleUserAction('account')}
                    className="w-full text-left px-3 py-2.5 mb-2 bg-white hover:bg-gray-100 rounded-lg text-sm text-gray-900 transition-colors flex items-center gap-2"
                  >
                    <User size={16} className="text-[#10254b]" />Account

                  </button>
                  <button
                    onClick={() => handleUserAction('orders')}
                    className="w-full text-left px-3 py-2.5 mb-2 bg-white hover:bg-gray-100 rounded-lg text-sm text-gray-900 transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart size={16} className="text-[#10254b]" />
                    Orders
                  </button>
                  <button
                    onClick={() => handleUserAction('logout')}
                    className="w-full text-left px-3 py-2.5 bg-red-50 hover:bg-red-100 rounded-lg text-sm text-red-600 transition-colors flex items-center gap-2"
                  >
                    <X size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  
                  <button
                    onClick={() => {
                      setShowMobileSidebar(false);
                      setShowLoginModal(true);
                    }}
                    className="w-44 text-center py-2.5 bg-transparent hover:bg-[#0d1d3a] text-[#10254b] rounded-lg text-sm font-medium transition-colors"
                  >
                    <User size={16} className="text-[#10254b]" />
                    
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* User Login Modal */}
      <UserLoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

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
        .heritage-scroll::-webkit-scrollbar-track { background: #f3f4f6; }
        .heritage-scroll::-webkit-scrollbar-thumb { background: #10254b; border-radius: 4px; }
        .heritage-scroll::-webkit-scrollbar-thumb:hover { background: #0d1d3a; }
      `}</style>
    </>
  );
};

export default MainHeader;