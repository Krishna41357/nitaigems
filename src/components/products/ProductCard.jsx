import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const hasDiscount = product.pricing?.discountedPrice && 
    product.pricing.discountedPrice < product.pricing.basePrice;

  const formatPrice = (price) => {
    if (!price) return '₹0';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isTogglingWishlist) return;

    try {
      setIsTogglingWishlist(true);
      setIsInWishlist(!isInWishlist);
      // Your wishlist API call here
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  // Simple product detail URL - always use /product/{sku}
  const getProductUrl = () => {
    return `/product/${product.sku}`;
  };

  return (
    <Link 
      to={getProductUrl()}
      className="block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gray-50 mb-5">
        {/* First Image */}
        <img
          src={product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out ${
            isHovered ? '-translate-x-full' : 'translate-x-0'
          }`}
          loading="lazy"
        />
        
        {/* Second Image (shown on hover) */}
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out ${
              isHovered ? 'translate-x-0' : 'translate-x-full'
            }`}
            loading="lazy"
          />
        )}

        {/* Wishlist Button - Minimal Transparent */}
        <button
          onClick={handleWishlistToggle}
          disabled={isTogglingWishlist}
          className={`absolute top-4 right-4 w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-10 disabled:opacity-50 ${
            isInWishlist 
              ? 'bg-white/90' 
              : 'bg-transparent hover:bg-white/40'
          }`}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              isInWishlist 
                ? 'fill-red-500 text-red-500' 
                : 'text-white stroke-2 drop-shadow-md'
            }`}
          />
        </button>

        {/* Out of Stock Overlay */}
        {!product.inventory?.inStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="bg-white px-5 py-2 rounded-full text-sm font-medium text-gray-900">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="text-center px-3">
        {/* Product Name */}
        <h3 className="font-serif text-lg text-gray-900 mb-3 line-clamp-2 min-h-[56px] group-hover:text-gray-600 transition-colors">
          {product.name}
        </h3>

        {/* Price Section */}
        {/* Price Section */}
        <div className="flex items-center justify-center gap-3">
          {hasDiscount ? (
            <>
              <p className="text-base text-gray-400 line-through">
                {formatPrice(product.pricing.basePrice)}
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {formatPrice(product.pricing.discountedPrice)}
              </p>
            </>
          ) : (
            <p className="text-xl font-semibold text-gray-900">
              {formatPrice(product.pricing?.basePrice)}
            </p>
          )}
        </div>

        {/* WhatsApp Inquiry Button */}
        <a
          href={`https://wa.me/916350288120?text=Hi! I'm interested in this product:%0A%0A*${encodeURIComponent(product.name)}*%0ASKU: ${product.sku}%0APrice: ${formatPrice(hasDiscount ? product.pricing.discountedPrice : product.pricing?.basePrice)}%0A%0AProduct Link: ${encodeURIComponent(window.location.origin + getProductUrl())}%0A%0ACould you please provide more details?`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-4 relative inline-flex items-center justify-center gap-2 w-full overflow-hidden group  hover:border-[#25d366] transition-all duration-300 rounded-lg"
        >
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#25d366]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Button content */}
          <div className="relative flex items-center justify-center gap-3 w-full py-3 px-4 max-md:py-2.5 max-md:px-3 max-md:gap-2">
            <div className="w-6 h-6 max-md:w-5 max-md:h-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="w-full h-full"
              />
            </div>
            <span className="text-base max-md:text-sm font-medium text-gray-700 group-hover:text-[#25d366] tracking-wide transition-colors duration-300">
              Ask About This
            </span>
            
            
          </div>
        </a>
      </div>
    </Link>
  );
};
     

export default ProductCard;