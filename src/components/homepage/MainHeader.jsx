import React, { useState, useEffect, useRef } from 'react';
import { Heart, User, ShoppingCart, Search, X, Menu } from 'lucide-react';
import { useCart, useWishlist } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import UserLoginModal from '../../components/auth/UserLoginModal';
import { useNavigate, useLocation } from 'react-router-dom';

const MainHeader = ({ logoUrl = '../media/logo/logo.jpg', onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const dropdownRef = useRef(null);

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const isOnProductsPage = location.pathname.startsWith('/products');
      
      if (isOnProductsPage) {
        navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
      }
      setShowMobileSearch(false);
    }
  };

  const handleNavigation = (path) => {
    if (path === '/cart') {
      navigate('/cart', { state: { from: location.pathname } });
      return;
    }
    navigate(path);
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

  const iconColor = "#b8860b";
  const headerFont = "'Cinzel', 'Playfair Display', serif";

  return (
    <React.Fragment>
      <header
        style={{ fontFamily: headerFont }}
        className={`border-b bg-[#fbf6ef] border-transparent sticky top-0 z-50 transition-shadow duration-200 ${
          isScrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="w-full max-w-full mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-2 sm:gap-3 md:gap-4">
            {/* Left Section - Logo */}
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={() => handleNavigation('/')}
                className="p-0 m-0 border-none bg-transparent flex items-center justify-center"
                aria-label="Go to home"
              >
                <img
                  src="./logo/logo.png"
                  alt="Logo"
                  className="h-8 sm:h-10 md:h-16 lg:h-20 w-auto object-contain"
                />
              </button>
            </div>

            {/* Center Section - Search Bar (Desktop/Tablet only) */}
            <div className="hidden md:flex flex-1 justify-center max-w-xl mx-2 lg:mx-6">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search size={16} color={iconColor} strokeWidth={1.5} className="lg:w-[18px] lg:h-[18px]" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  placeholder="Search for jewellery..."
                  className="w-full pl-9 lg:pl-12 pr-3 lg:pr-4 py-2 lg:py-2.5 bg-white/95 border border-[#efe6d9] rounded-full focus:outline-none focus:ring-2 focus:ring-[#e9d6a1] focus:border-[#d4a055] text-xs lg:text-sm text-[#3b1b12] placeholder-[#a88a60] shadow-sm"
                />
              </form>
            </div>

            {/* Right Section - Icons */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-1.5 sm:p-2 bg-transparent relative hover:scale-105 transition-transform"
                aria-label="Search"
              >
                {showMobileSearch ? (
                  <X size={18} color={iconColor} strokeWidth={1.5} className="sm:w-5 sm:h-5" />
                ) : (
                  <Search size={18} color={iconColor} strokeWidth={1.5} className="sm:w-5 sm:h-5" />
                )}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => handleNavigation('/wishlist')}
                className="p-1.5 sm:p-2 bg-transparent relative group hover:scale-105 transition-transform"
                aria-label="Wishlist"
              >
                <Heart size={18} color={iconColor} strokeWidth={1.5} className="sm:w-5 sm:h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-600 text-white text-[10px] sm:text-xs w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center rounded-full font-medium">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
                <span className="hidden lg:block absolute -bottom-8 right-0 bg-[#3b1b12] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Wishlist
                </span>
              </button>

              {/* User Profile */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="p-1.5 sm:p-2 bg-transparent relative group hover:scale-105 transition-transform"
                  aria-label="User account"
                >
                  <User size={18} color={iconColor} strokeWidth={1.5} className="sm:w-5 sm:h-5" />
                  <span className="hidden lg:block absolute -bottom-8 right-0 bg-[#3b1b12] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Account
                  </span>
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-44 sm:w-48 bg-white border border-[#efe6d9] rounded-lg shadow-lg py-2 animate-fadeIn z-50">
                    {isAuthenticated ? (
                      <>
                        {user && (
                          <div className="px-3 sm:px-4 py-2 border-b border-gray-200">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                              {user.name || user.email}
                            </p>
                          </div>
                        )}
                        <button
                          onClick={() => handleUserAction('account')}
                          className="w-full text-left bg-white text-black hover:border-none border-none px-3 sm:px-4 py-2 hover:bg-gray-50 text-xs sm:text-sm transition-colors"
                        >
                          My Account
                        </button>
                        <button
                          onClick={() => handleUserAction('orders')}
                          className="w-full text-left px-3 sm:px-4 py-2 bg-white text-black hover:border-none hover:bg-gray-50 text-xs sm:text-sm transition-colors"
                        >
                          My Orders
                        </button>
                        <button
                          onClick={() => handleUserAction('logout')}
                          className="w-full text-left px-3 sm:px-4 py-2 border-none hover:border-none bg-red-50 hover:bg-red-100 text-xs sm:text-sm text-red-600 transition-colors"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleUserAction('login')}
                          className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-50 text-xs sm:text-sm transition-colors"
                        >
                          Login
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => handleNavigation('/cart')}
                className="p-1.5 sm:p-2 bg-transparent relative group hover:scale-105 transition-transform"
                aria-label="Shopping cart"
              >
                <ShoppingCart size={20} color={iconColor} strokeWidth={1.5} className="sm:w-[22px] sm:h-[22px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-600 text-white text-[10px] sm:text-xs w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center rounded-full font-medium">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
                <span className="hidden lg:block absolute -bottom-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Cart
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden bg-[#fbf6ef] border-t border-[#efe6d9] px-3 sm:px-4 py-3">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search size={16} color={iconColor} strokeWidth={1.5} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Search for jewellery..."
                className="w-full pl-10 pr-3 py-2 bg-white border border-[#efe6d9] rounded-full focus:outline-none focus:ring-2 focus:ring-[#e9d6a1] focus:border-[#d4a055] text-sm text-[#3b1b12] placeholder-[#a88a60]"
                autoFocus
              />
            </form>
          </div>
        )}
      </header>

      {/* User Login Modal */}
      <UserLoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

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
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </React.Fragment>
  );
};

export default MainHeader;