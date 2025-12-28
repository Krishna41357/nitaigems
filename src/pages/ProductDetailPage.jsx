import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Heart,
  Share2,
  ChevronDown,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Home,
  Package,
  X,
  MessageCircle,
  Truck,
  Shield,
  Info,
} from "lucide-react";
import MainHeader from "../components/homepage/MainHeader";
import UserLoginModal from "../components/auth/UserLoginModal";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/Loading";

const ProductDetailPage = () => {
  const { sku, categorySlug, subCategorySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const carouselRef = useRef(null);

  /* ---- state ---- */
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomedImageIndex, setZoomedImageIndex] = useState(0);

  const headerFont = "'Cinzel', 'Playfair Display', serif";

  /* ---- fetch product by SKU ---- */
  useEffect(() => {
    fetchProduct();
  }, [sku]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${import.meta.env.VITE_APP_BASE_URL}/products/sku/${sku}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status === 404 ? "Product not found" : "Failed to fetch");
      const data = await res.json();
      setProduct(data);
      if (data.necklaceLayers?.length) {
        setSelectedLayer(data.necklaceLayers[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---- fetch recommended products ---- */
  useEffect(() => {
    if (product?.categorySlug) {
      fetchRecommendedProducts();
    }
  }, [product?.categorySlug]);

  const fetchRecommendedProducts = async () => {
    setRecommendedLoading(true);
    try {
      const url = `${import.meta.env.VITE_APP_BASE_URL}/products?limit=8`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRecommendedProducts(data.filter(p => p.sku !== product?.sku).slice(0, 8));
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setRecommendedLoading(false);
    }
  };

  /* ---- Helper to truncate text ---- */
  const truncateText = (text, maxLength = 7) => {
    if (!text) return '';
    const cleanText = text.replace(/-/g, ' ');
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
  };

  /* ---- breadcrumbs ---- */
  const getBreadcrumbs = () => {
    const crumbs = [
      { label: "Home", path: "/", fullLabel: "Home" },
      { label: "Products", path: "/products", fullLabel: "Products" }
    ];
    
    if (categorySlug) {
      const fullLabel = categorySlug.replace(/-/g, " ");
      crumbs.push({
        label: truncateText(fullLabel, 10),
        path: `/products/category/${categorySlug}`,
        fullLabel: fullLabel
      });
    }
    
    if (subCategorySlug) {
      const fullLabel = subCategorySlug.replace(/-/g, " ");
      crumbs.push({
        label: truncateText(fullLabel, 10),
        path: `/products/category/${categorySlug}/${subCategorySlug}`,
        fullLabel: fullLabel
      });
    }
    
    if (product) {
      crumbs.push({
        label: truncateText(product.name, 15),
        path: null,
        fullLabel: product.name
      });
    }
    
    return crumbs;
  };

  /* ---- helpers ---- */
  const getCurrentPrice = () => {
    if (selectedLayer) return selectedLayer.price;
    return product?.pricing?.discountedPrice || product?.pricing?.basePrice || 0;
  };

  const getOriginalPrice = () => {
    if (!product?.necklaceLayers?.length) return product?.pricing?.basePrice || 0;
    return selectedLayer?.price || 0;
  };

  const hasDiscount = () => {
    if (product?.necklaceLayers?.length) return false;
    return getCurrentPrice() < getOriginalPrice();
  };

  const getDiscountPercent = () => (hasDiscount() ? Math.round(((getOriginalPrice() - getCurrentPrice()) / getOriginalPrice()) * 100) : 0);

  const formatPrice = (p) => (p ? `₹${p.toLocaleString("en-IN")}` : "₹0");

  const toggleWishlist = () => setIsInWishlist((v) => !v);

  /* ---- Image Zoom Handlers ---- */
  const handleImageClick = (index) => {
    setZoomedImageIndex(index);
    setIsZoomOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeZoom = () => {
    setIsZoomOpen(false);
    document.body.style.overflow = 'unset';
  };

  /* ---- Share Handlers ---- */
  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this product: ${product.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const handleWhatsAppShare = () => {
    const price = formatPrice(getCurrentPrice());
    const message = `Hi! I'm interested in this product:%0A%0A*${encodeURIComponent(product.name)}*%0ASKU: ${product.sku}%0APrice: ${price}%0A%0AProduct Link: ${encodeURIComponent(window.location.href)}%0A%0ACould you please provide more details?`;
    window.open(`https://wa.me/916350288120?text=${message}`, '_blank');
  };

  /* ---- add to cart ---- */
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setCartLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const body = {
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        product_image: product.images?.[0] || "/placeholder.jpg",
        sku: product.sku,
        quantity: 1,
        price: getCurrentPrice(),
        metal: product.details?.metal || null,
        metal_purity: product.details?.metalPurity || null,
        stone: product.details?.stone || null,
        stone_type: product.details?.stoneType || null,
        ...(selectedLayer && { selectedLayer: selectedLayer.layer, selectedLayerPrice: selectedLayer.price }),
      };
      const res = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        alert("Product added to cart!");
        navigate("/cart", { state: { from: location.pathname, productName: product.name } });
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add to cart");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setCartLoading(false);
    }
  };

  /* ---- buy now ---- */
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!product?.inventory?.inStock) {
      alert("Product is out of stock");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    setBuyNowLoading(true);

    try {
      const price = selectedLayer?.price ?? product.price;

      const res = await fetch(
        `${import.meta.env.VITE_APP_BASE_URL}/cart/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: product.id,
            product_name: product.name,
            product_slug: product.slug,
            product_image: product.images?.[0],
            sku: product.sku,
            quantity: 1,
            price,
            buyNow: true,
            ...(selectedLayer && {
              metal: selectedLayer.layer,
              metal_purity: selectedLayer.purity,
            }),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not proceed to checkout");
      }

      navigate("/checkout", { state: { buyNow: true } });

    } catch (error) {
      console.error("Buy Now error:", error);
      alert(error.message || "Network error. Please try again.");
    } finally {
      setBuyNowLoading(false);
    }
  };

  /* ---- loading / error ---- */
  if (loading) {
    return (
      <>
        <Loading/>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <MainHeader />
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center max-w-2xl">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Product Not Found</h2>
            <p className="text-gray-600 mb-2">We couldn't find a product with SKU: <strong>"{sku}"</strong></p>
            <p className="text-red-600 text-sm mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">Go Back</button>
              <button onClick={() => navigate("/products")} className="bg-[#10254b] text-white px-6 py-3 rounded-lg hover:bg-[#0d1d3a] transition-colors">Browse All Products</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MainHeader />
      <UserLoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      {/* Image Zoom Modal */}
      {/* Image Zoom Modal */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center overflow-hidden"
          onClick={closeZoom}
        >
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={closeZoom}
              className="text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Main Content */}
          <div className="w-full h-full flex items-center justify-center p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-4 max-w-6xl">
              
              {/* Thumbnails - Hidden on mobile, shown beside on desktop */}
              {product.images?.length > 1 && (
                <div className="hidden md:flex flex-col gap-3 max-h-[85vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setZoomedImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        zoomedImageIndex === idx ? "border-white ring-2 ring-white/50" : "border-white/30 hover:border-white/60"
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Main Image */}
              <div className="flex-1 w-full h-full max-h-[80vh] md:max-h-[85vh] flex items-center justify-center">
                <img
                  src={product.images?.[zoomedImageIndex] || "/placeholder.jpg"}
                  alt={product.name}
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
                />
              </div>
              
              {/* Navigation Arrows for Mobile */}
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
                    }}
                    className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
                    }}
                    className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                  
                  {/* Image Counter for Mobile */}
                  <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                    {zoomedImageIndex + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>

      <div className="min-h-screen bg-white">
        <div className="w-full px-4 md:px-8 lg:px-12 py-6 md:py-8">
          {/* Breadcrumbs */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="flex items-center gap-1.5 mb-4 md:mb-6 text-xs md:text-sm">
              {getBreadcrumbs().map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-1 flex-shrink-0">
                  {idx > 0 && <span className="text-gray-400">{'>'}</span>}
                  {crumb.path ? (
                    <button 
                      onClick={() => navigate(crumb.path)} 
                      className="flex bg-transparent items-center gap-1 text-black hover:text-[#10254b] transition-colors"
                      title={crumb.fullLabel}
                    >
                      {idx === 0 && <Home size={14} />}
                      {idx === 1 && <Package size={14} />}
                      <span className="max-w-[120px] truncate">{crumb.label}</span>
                    </button>
                  ) : (
                    <span className="text-black font-semibold ml-2 max-w-[150px] truncate" title={crumb.fullLabel}>
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* IMAGE GALLERY - Left Side - Grid Layout */}
              <div className="space-y-4">
                {product.images && product.images.length > 0 && (
                  <div className={`grid gap-3 ${
                    product.images.length === 1 ? 'grid-cols-1' :
                    product.images.length === 2 ? 'grid-cols-2' :
                    product.images.length === 3 ? 'grid-cols-2' :
                    'grid-cols-2'
                  }`}>
                    {product.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative bg-gray-50 rounded-lg overflow-hidden cursor-pointer group ${
                          product.images.length === 3 && idx === 0 ? 'col-span-2' : ''
                        } ${product.images.length === 1 ? 'aspect-square' : 'aspect-square'}`}
                        onClick={() => handleImageClick(idx)}
                      >
                        <img 
                          src={img} 
                          alt={`${product.name} ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2">
                            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                        {!product.inventory?.inStock && idx === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-white px-6 py-2 rounded-full font-semibold text-gray-900">Out of Stock</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PRODUCT INFO - Right Side */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-serif text-gray-900 mb-2">{product.name}</h1>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </div>

                <div className="border-t border-b border-gray-200 py-4">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl font-bold text-gray-900">{formatPrice(getCurrentPrice())}</span>
                    {hasDiscount() && (
                      <>
                        <span className="text-lg text-gray-400 line-through">{formatPrice(getOriginalPrice())}</span>
                        <span className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded font-semibold">{getDiscountPercent()}% OFF</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Incl. taxes and charges</p>
                </div>

                {/* LAYER SELECTOR */}
                {/* LAYER SELECTOR */}
{product.necklaceLayers?.length > 0 && (
  <div className="mt-4">
    <div className="grid grid-cols-2 gap-3">
      {product.necklaceLayers.map((lyr) => (
        <button
          key={lyr.layer}
          onClick={() => setSelectedLayer(lyr)}
          className={`
            py-3 px-4 rounded-full border text-sm font-medium
            transition-all duration-200
            ${
              selectedLayer?.layer === lyr.layer
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-300 hover:border-black"
            }
          `}
        >
          {lyr.layer}
        </button>
      ))}
    </div>
  </div>
)}


                {product.inventory && (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${product.inventory.inStock ? "bg-green-500" : "bg-red-500"}`} />
                    <span className={`text-sm font-medium ${product.inventory.inStock ? "text-green-700" : "text-red-700"}`}>
                      {product.inventory.inStock ? `In Stock (${product.inventory.stock} available)` : "Out of Stock"}
                    </span>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="space-y-3">
  {/* Buy Now and Add to Cart - Full Width */}
  <button
    onClick={handleBuyNow}
    disabled={!product.inventory?.inStock || buyNowLoading}
    className="w-full bg-[#10254b] text-white py-4 rounded-lg font-semibold hover:bg-[#0d1d3a] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
  >
    {buyNowLoading ? (
      <>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        <span>Processing...</span>
      </>
    ) : (
      <>
        <ShoppingBag size={20} />
        <span>Buy Now</span>
      </>
    )}
  </button>
  
  <button
    onClick={handleAddToCart}
    disabled={!product.inventory?.inStock || cartLoading}
    className="w-full bg-white border-2 border-[#10254b] text-[#10254b] py-4 rounded-lg font-semibold hover:bg-[#10254b] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
  >
    <ShoppingCart size={20} />
    {cartLoading ? "Adding..." : "Add to Cart"}
  </button>

  {/* WhatsApp Button - Full Width */}
  <button
    onClick={handleWhatsAppShare}
    className="relative w-full inline-flex items-center justify-center gap-2 overflow-hidden group bg-gradient-to-r from-[#25d366] to-[#128c7e] hover:from-[#20ba5a] hover:to-[#0f7a6c] transition-all duration-300 rounded-lg shadow-md hover:shadow-lg py-4 px-4"
  >
    {/* Animated background effect */}
    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
    
    {/* Shine effect */}
    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    
    {/* Button content */}
    <div className="relative flex items-center justify-center gap-2 w-full">
      {/* WhatsApp Icon */}
      <svg 
        viewBox="0 0 24 24" 
        fill="white" 
        className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      
      {/* Text */}
      <span className="text-base font-semibold text-white">
        Chat on WhatsApp
      </span>
      
      {/* Arrow icon */}
      <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform duration-300" />
    </div>
  </button>

  {/* Wishlist and Share - Side by Side */}
  <div className="grid grid-cols-2 gap-3">
    <button
      onClick={toggleWishlist}
      className={`py-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
        isInWishlist ? "bg-red-50 border-none text-red-700" : "bg-white border-none text-gray-700 hover:border-none"
      }`}
    >
      <Heart size={20} className={isInWishlist ? "fill-red-500" : ""} />
      <span>Whishlist</span>
    </button>
    
    <button 
      onClick={handleShare}
      className="py-4 rounded-lg border-2 border-[#12054b] text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2 bg-white"
    >
      <Share2 size={20} />
      <span className="text-sm  font-medium">Share</span>
    </button>
  </div>
</div>
                {/* COLLAPSIBLE SECTIONS */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <DetailSection 
                    title="Product Description" 
                    icon={<Info size={20} className="text-gray-600" />}
                    product={product}
                  />
                  <DetailSection 
                    title="Shipping Information" 
                    icon={<Truck size={20} className="text-gray-600" />}
                    isShipping
                  />
                  <DetailSection 
                    title="Guarantee & Certifications" 
                    icon={<Shield size={20} className="text-gray-600" />}
                    product={product}
                    isCertification
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RECOMMENDED PRODUCTS CAROUSEL */}
        {recommendedProducts.length > 0 && (
          <RecommendedProductsCarousel
            products={recommendedProducts}
            loading={recommendedLoading}
            navigate={navigate}
          />
        )}
      </div>
    </>
  );
};

/* Re-usable collapsible section */
const DetailSection = ({ title, children, icon, isShipping, isCertification, product }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex bg-white items-center justify-between py-4 px-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="pb-4 px-6 text-gray-700 bg-gray-50">
          {isShipping ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Truck size={18} className="text-gray-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Standard Delivery</p>
                  <p className="text-sm text-gray-600">Delivered in 7-10 business days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package size={18} className="text-gray-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Secure Packaging</p>
                  <p className="text-sm text-gray-600">All products are carefully packed to ensure safe delivery</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info size={18} className="text-gray-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Order Tracking</p>
                  <p className="text-sm text-gray-600">Track your order status with real-time updates</p>
                </div>
              </div>
            </div>
          ) : isCertification ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-gray-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Quality Guarantee</p>
                  <p className="text-sm text-gray-600">All products come with a certificate of authenticity</p>
                </div>
              </div>
              {product?.details?.certification && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">Certification</p>
                  <p className="text-sm text-gray-600 mt-1">{product.details.certification}</p>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Info size={18} className="text-gray-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Return Policy</p>
                  <p className="text-sm text-gray-600">7-day return policy for all jewelry items</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {product?.description && (
                <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                {product?.details?.metal && (
                  <div>
                    <p className="text-sm text-gray-500">Metal</p>
                    <p className="font-medium text-gray-900">{product.details.metal}</p>
                  </div>
                )}
                {product?.details?.metalPurity && (
                  <div>
                    <p className="text-sm text-gray-500">Purity</p>
                    <p className="font-medium text-gray-900">{product.details.metalPurity}</p>
                  </div>
                )}
                {product?.details?.weight > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="font-medium text-gray-900">{product.details.weight}g</p>
                  </div>
                )}
                {product?.details?.size && (
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="font-medium text-gray-900">{product.details.size}</p>
                  </div>
                )}
              </div>
              {product?.tags?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((t, i) => (
                      <span key={i} className="px-3 py-1 bg-white border border-gray-200 text-gray-700 text-sm rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* RECOMMENDED PRODUCTS CAROUSEL COMPONENT */
const RecommendedProductsCarousel = ({ products, loading, navigate }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const carouselRef = useRef(null);

  /* ---------- helpers ---------- */
  const formatPrice = (p) => {
    const price = p.pricing?.discountedPrice || p.pricing?.basePrice || 0;
    return price ? `₹${price.toLocaleString("en-IN")}` : "₹0";
  };
  const hasDiscount = (p) =>
    p.pricing?.discountedPrice && p.pricing.discountedPrice < p.pricing.basePrice;
  const getDiscountPercent = (p) =>
    hasDiscount(p)
      ? Math.round(
          ((p.pricing.basePrice - p.pricing.discountedPrice) /
            p.pricing.basePrice) *
            100
        )
      : 0;

  /* ---------- scroll logic ---------- */
  const updateButtons = () => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(
      el.scrollLeft < el.scrollWidth - el.clientWidth - 10
    );
    setScrollPosition(el.scrollLeft);
  };

  const scroll = (dir) => {
    if (!carouselRef.current) return;
    const cardWidth =
      window.innerWidth < 640 ? 190 : window.innerWidth < 768 ? 220 : window.innerWidth < 1024 ? 260 : 300;
    carouselRef.current.scrollBy({
      left: dir === "left" ? -cardWidth * 2 : cardWidth * 2,
      behavior: "smooth",
    });
    setTimeout(updateButtons, 300);
  };

  useEffect(() => {
    updateButtons();
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateButtons);
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [products]);

  /* ---------- render ---------- */
  if (loading) {
    return (
      <div className="w-full py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#832729]" />
          </div>
        </div>
      </div>
    );
  }
  if (!products?.length) return null;

  return (
    <div className="w-full bg-gray-50 py-12 border-t border-gray-200">
      <div className="w-full">
        {/* heading */}
        <div className="mb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif text-gray-900">
            You May Also Like
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Discover similar items you might love
          </p>
        </div>

        <div className="relative w-full">
          {/* DOTS – visible only on small screens */}
          <div className="flex justify-center gap-1.5 mb-4 md:hidden">
            {Array.from({ length: Math.min(products.length, 5) }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  Math.floor(scrollPosition / 190) === idx
                    ? "w-6 bg-[#832729]"
                    : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* ARROWS – always visible (no md:flex hidden) */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all hover:scale-110 border border-gray-200 flex items-center justify-center"
              aria-label="Scroll left"
              style={{ marginLeft: "20px" }}
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all hover:scale-110 border border-gray-200 flex items-center justify-center"
              aria-label="Scroll right"
              style={{ marginRight: "20px" }}
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* scrollable strip */}
          <div
            ref={carouselRef}
            className="recommended-products-carousel flex flex-nowrap gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden px-4 sm:px-6 lg:px-8 pb-4 w-full"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style>{`
              div[style*="scrollSnapType"]::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.sku}`)}
                className="flex-shrink-0 w-[170px] sm:w-[200px] md:w-[240px] lg:w-[280px] bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-transparent hover:border-[#832729] overflow-hidden"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={p.images?.[0] || "/placeholder.jpg"}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {hasDiscount(p) && (
                    <div className="absolute top-2 right-2 bg-gradient-to-br from-green-500 to-green-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                      {getDiscountPercent(p)}% OFF
                    </div>
                  )}
                  {!p.inventory?.inStock && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-white px-4 py-2 rounded-full text-xs font-semibold text-gray-900">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="font-serif text-sm text-gray-900 mb-2 line-clamp-2 min-h-[40px] group-hover:text-[#832729] transition-colors leading-tight">
                    {p.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(p)}
                    </span>
                    {hasDiscount(p) && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{p.pricing.basePrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {(p.details?.metal || p.details?.metalPurity) && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      {p.details.metal && (
                        <span className="truncate">{p.details.metal}</span>
                      )}
                      {p.details.metal && p.details.metalPurity && (
                        <span>•</span>
                      )}
                      {p.details.metalPurity && (
                        <span className="truncate">{p.details.metalPurity}</span>
                      )}
                    </div>
                  )}

                  {p.inventory?.inStock && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-xs text-green-700 font-medium">
                        In Stock
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

