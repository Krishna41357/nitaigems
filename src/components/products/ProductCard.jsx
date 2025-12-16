import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { categorySlug, subCategorySlug } = useParams();
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

  // UPDATED: Generate product URL using SKU instead of slug
  const getProductUrl = () => {
    if (categorySlug && subCategorySlug) {
      return `/products/category/${categorySlug}/${subCategorySlug}/${product.sku}`;
    } else if (categorySlug) {
      return `/products/category/${categorySlug}/${product.sku}`;
    } else if (product.collectionSlug) {
      return `/products/collection/${product.collectionSlug}/${product.sku}`;
    } else {
      return `/product/${product.sku}`;
    }
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
      </div>
    </Link>
  );
};

export default ProductCard;