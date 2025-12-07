/* -------------------------------------------------
   ProductDetailPage.jsx  –  PART 1 of 2
-------------------------------------------------- */
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import MainHeader from "../components/homepage/MainHeader";
import Navigation from "../components/homepage/Navigation";
import Footer from "../components/homepage/Footer";
import { useAuth } from "../contexts/AuthContext";

const ProductDetailPage = () => {
  const { slug, categorySlug, subCategorySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

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

  /* ---- font used in CartPage ---- */
  const headerFont = "'Cinzel', 'Playfair Display', serif";

  /* ---- Auto-change images every 3 seconds ---- */
  useEffect(() => {
    if (!product?.images || product.images.length <= 1) return;
    
    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [product?.images]);

  /* ---- fetch product ---- */
  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${import.meta.env.VITE_APP_BASE_URL}/products/slug/${slug}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status === 404 ? "Product not found" : "Failed to fetch");
      const data = await res.json();
      setProduct(data);
      // Set first layer as default if layers exist
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
        // Filter out current product
        setRecommendedProducts(data.filter(p => p.id !== product?.id).slice(0, 8));
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setRecommendedLoading(false);
    }
  };

  /* ---- breadcrumbs (CartPage style) ---- */
  const getBreadcrumbs = () => {
    const crumbs = [{ label: "Home", path: "/" } , { label: "Products", path: "/products" }];
    if (categorySlug) crumbs.push({ label: categorySlug.replace(/-/g, " "), path: `/products/category/${categorySlug}` });
    if (subCategorySlug) crumbs.push({ label: subCategorySlug.replace(/-/g, " "), path: `/products/category/${categorySlug}/${subCategorySlug}` });
    if (product) crumbs.push({ label: product.name, path: null });
    return crumbs;
  };

  /* ---- helpers ---- */
  const getCurrentPrice = () => {
    if (selectedLayer) {
      return selectedLayer.price;
    }
    return product?.pricing?.discountedPrice || product?.pricing?.basePrice || 0;
  };

  const getOriginalPrice = () => {
    // If no layers, use base pricing
    if (!product?.necklaceLayers?.length) {
      return product?.pricing?.basePrice || 0;
    }
    // If layers exist, use selected layer price (no discount on layers)
    return selectedLayer?.price || 0;
  };

  const hasDiscount = () => {
    // Only show discount if no layers
    if (product?.necklaceLayers?.length) return false;
    return getCurrentPrice() < getOriginalPrice();
  };

  const getDiscountPercent = () => (hasDiscount() ? Math.round(((getOriginalPrice() - getCurrentPrice()) / getOriginalPrice()) * 100) : 0);

  const formatPrice = (p) => (p ? `₹${p.toLocaleString("en-IN")}` : "₹0");

  const toggleWishlist = () => setIsInWishlist((v) => !v);
  const toggleSection = (s) => setExpandedSection((v) => (v === s ? null : s));

  /* ---- add to cart ---- */
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      if (window.confirm("Please login to add items to cart. Login now?")) navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setCartLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const body = {
        product_id: product.id,
        product_name: product.name,
        product_slug: slug,
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
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!product.inventory?.inStock) {
      alert("Product is out of stock");
      return;
    }
    setBuyNowLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/cart/buy-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          product_id: product.id, 
          quantity: 1, 
          ...(selectedLayer && { selectedLayer: selectedLayer.layer, selectedLayerPrice: selectedLayer.price }) 
        }),
      });
      if (res.ok) {
        navigate("/checkout", { state: { buyNow: true } });
      } else {
        const data = await res.json();
        alert(data.message || "Could not proceed to checkout");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setBuyNowLoading(false);
    }
  };

  /* ---- loading / error ---- */
  if (loading)
    return (
      <>
        <MainHeader />
        <Navigation />
        <div className="min-h-screen w-screen bg-black/95 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-yellow-500/5 via-transparent to-transparent"></div>
          <div className="text-center relative z-10">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 -m-6">
                <div className="w-36 h-36 border border-transparent border-t-yellow-500/70 rounded-full animate-spin" style={{ animationDuration: "3s" }}></div>
              </div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-full p-4 shadow-2xl shadow-yellow-500/20 backdrop-blur-sm border border-yellow-500/20">
                <img src="./logo/logo.png" alt="Nitai Gems" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-yellow-500 text-2xl font-serif font-light tracking-widest">Nitai Gems</p>
              <div className="flex items-center justify-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }}></span>
                <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }}></span>
              </div>
            </div>
          </div>
        </div>
      </>
    );

  if (error || !product)
    return (
      <>
        <MainHeader />
        <Navigation />
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center max-w-2xl">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Product Not Found</h2>
            <p className="text-gray-600 mb-2">We couldn't find a product with slug: <strong>"{slug}"</strong></p>
            <p className="text-red-600 text-sm mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">Go Back</button>
              <button onClick={() => navigate("/products")} className="bg-[#832729] text-white px-6 py-3 rounded-lg hover:bg-[#6A1F21] transition-colors">Browse All Products</button>
            </div>
          </div>
        </div>
      </>
    );

  /* ------------------------------------------------------------------
     MAIN RENDER - PART 1 ENDS HERE
     Continue with PART 2 below...
  ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------
     MAIN RENDER - PART 2
  ------------------------------------------------------------------ */
  return (
    <>
      <MainHeader />
      <Navigation />
      <div className="min-h-screen bg-white">
        <div className="w-screen px-4 md:px-8 lg:px-12 py-6 md:py-8">
          {/* ===== Breadcrumbs – CartPage style ===== */}
          <div className="max-w-7xl mx-auto mb-6">
            <div style={{ fontFamily: headerFont }} className="flex items-center gap-1.5 mb-4 md:mb-6 text-xs md:text-sm overflow-x-auto pb-2">
              {getBreadcrumbs().map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-1 flex-shrink-0">
                  {idx > 0 && <span className="text-[#b8860b]">{'>'}</span>}
                  {crumb.path ? (
                    <button onClick={() => navigate(crumb.path)} className="breadcrumb-item flex bg-transparent items-center gap-1 text-[#6b5342] hover:text-[#b8860b] transition-colors whitespace-nowrap">
                      {idx === 0 && <Home size={14} />}
                      {idx === 1 && <Package size={14} />}
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-[#3b1b12] font-semibold ml-2 whitespace-nowrap">{crumb.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* --------------- IMAGE GALLERY --------------- */}
              <div className="space-y-4">
                <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden">
                  <img src={product.images?.[selectedImage] || "/placeholder.jpg"} alt={product.name} className="w-full h-full object-cover" />
                  {!product.inventory?.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white px-6 py-2 rounded-full font-semibold text-gray-900">Out of Stock</span>
                    </div>
                  )}
                  {/* Image counter */}
                  {product.images?.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImage + 1} / {product.images.length}
                    </div>
                  )}
                </div>
                {product.images?.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {product.images.map((img, idx) => (
                      <button key={idx} onClick={() => setSelectedImage(idx)} className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? "border-[#832729] ring-2 ring-[#832729]/20" : "border-gray-200 hover:border-gray-300"}`}>
                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* --------------- PRODUCT INFO --------------- */}
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

                {/* --------------- LAYER SELECTOR (Light Theme) --------------- */}
                {product.necklaceLayers?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Select Layer: <span className="text-amber-700">{selectedLayer?.layer}</span>
                    </label>
                    <select
                      value={selectedLayer?.layer}
                      onChange={(e) => setSelectedLayer(product.necklaceLayers.find((l) => l.layer === e.target.value))}
                      className="w-full px-4 py-3 bg-white border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-gray-900 font-medium"
                    >
                      {product.necklaceLayers.map((lyr) => (
                        <option key={lyr.layer} value={lyr.layer}>
                          {lyr.layer} – {formatPrice(lyr.price)}
                        </option>
                      ))}
                    </select>
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

                {/* --------------- ACTION BUTTONS --------------- */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={handleBuyNow}
                      disabled={!product.inventory?.inStock || buyNowLoading}
                      className="flex-1 bg-gradient-to-r from-[#b8860b] to-[#d4a055] text-white py-4 rounded-xl font-semibold hover:from-[#a06f09] hover:to-[#b8860b] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      className="flex-1 bg-white border-2 border-[#832729] text-[#832729] py-4 rounded-lg font-semibold hover:bg-[#832729] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartLoading ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={toggleWishlist}
                      className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                        isInWishlist ? "bg-red-50 border-red-500 text-red-700" : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isInWishlist ? "fill-red-500" : ""}`} />
                      {isInWishlist ? "Wishlisted" : "Add to Wishlist"}
                    </button>
                    <button className="py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* --------------- COLLAPSIBLE SECTIONS --------------- */}
                <div className="border-gray-300 font-serif border-2 border-t-0 rounded-r-xl rounded-l-xl border-b-2 space-y-2">
                  {(product.details?.metal || product.details?.metalPurity || product.details?.metalWeight) && (
                    <DetailSection title="METAL DETAILS" icon={<div className="w-5 h-5 text-amber-600">⚜</div>}>
                      <div className="grid grid-cols-2 bg-white gap-4">
                        {product.details.metal && (
                          <div>
                            <p className="text-md text-gray-500">Metal</p>
                            <p className="font-medium">{product.details.metal}</p>
                          </div>
                        )}
                        {product.details.metalPurity && (
                          <div>
                            <p className="text-sm text-gray-500">Purity</p>
                            <p className="font-medium">{product.details.metalPurity}</p>
                          </div>
                        )}
                        {product.details.metalWeight > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">Metal Weight</p>
                            <p className="font-medium">{product.details.metalWeight}g</p>
                          </div>
                        )}
                        {product.details.weight > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">Gross Weight</p>
                            <p className="font-medium">{product.details.weight}g</p>
                          </div>
                        )}
                      </div>
                    </DetailSection>
                  )}

                  {(product.details?.stone || product.details?.stoneType || product.details?.stoneWeight) && (
                    <DetailSection title="DIAMOND/STONE DETAILS" icon={<div className="w-5 h-5 text-blue-600">💎</div>}>
                      <div className="grid grid-cols-2 gap-4">
                        {product.details.stone && (
                          <div>
                            <p className="text-sm text-gray-500">Stone</p>
                            <p className="font-medium">{product.details.stone}</p>
                          </div>
                        )}
                        {product.details.stoneType && (
                          <div>
                            <p className="text-sm text-gray-500">Type</p>
                            <p className="font-medium">{product.details.stoneType}</p>
                          </div>
                        )}
                        {product.details.clarity && (
                          <div>
                            <p className="text-sm text-gray-500">Clarity</p>
                            <p className="font-medium">{product.details.clarity}</p>
                          </div>
                        )}
                        {product.details.color && (
                          <div>
                            <p className="text-sm text-gray-500">Color</p>
                            <p className="font-medium">{product.details.color}</p>
                          </div>
                        )}
                        {product.details.stoneWeight > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">Stone Weight</p>
                            <p className="font-medium">{product.details.stoneWeight} ct</p>
                          </div>
                        )}
                      </div>
                    </DetailSection>
                  )}

                  {(product.details?.size || product.details?.certification) && (
                    <DetailSection title="GENERAL DETAILS" icon={<div className="w-5 h-5 text-gray-600">ℹ</div>}>
                      <div className="grid grid-cols-2 gap-4">
                        {product.details.size && (
                          <div>
                            <p className="text-sm text-gray-500">Size</p>
                            <p className="font-medium">{product.details.size}</p>
                          </div>
                        )}
                        {product.details.certification && (
                          <div>
                            <p className="text-sm text-gray-500">Certification</p>
                            <p className="font-medium">{product.details.certification}</p>
                          </div>
                        )}
                      </div>
                    </DetailSection>
                  )}

                  {product.tags?.length > 0 && (
                    <DetailSection title="FEATURES" icon={<div className="w-5 h-5 text-purple-600">🏷</div>}>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((t, i) => (
                          <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    </DetailSection>
                  )}

                  {product.pricing?.couponApplicable && (
                    <DetailSection title="OFFERS" icon={<div className="w-5 h-5 text-green-600">🎁</div>}>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800 font-medium mb-2">Coupon Applicable</p>
                        {product.pricing.couponList?.length > 0 && (
                          <div className="space-y-2">
                            {product.pricing.couponList.map((c, i) => (
                              <div key={i} className="bg-white px-3 py-2 rounded border border-green-300">
                                <p className="text-sm font-mono text-gray-900">{c}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </DetailSection>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --------------- YOU MAY ALSO LIKE SECTION --------------- */}
        {recommendedProducts.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-8">You May Also Like</h2>
            <RecommendedProducts products={recommendedProducts} loading={recommendedLoading} navigate={navigate} />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

/* ------------------------------------------------------------------
   Re-usable collapsible section
------------------------------------------------------------------ */
const DetailSection = ({ title, children, icon }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const isOpen = expandedSection === title;
  return (
    <div className="border-t-2 border-l-1 border-r-1 rounded-t-xl border-grey-400">
      <button onClick={() => setExpandedSection(isOpen ? null : title)} className="w-full flex bg-white items-center justify-between py-4 text-left px-4">
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="pb-4 px-4 text-gray-700 font-serif">{children}</div>}
    </div>
  );
};

/* ------------------------------------------------------------------
   Recommended Products Carousel
------------------------------------------------------------------ */
const RecommendedProducts = ({ products, loading, navigate }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const formatPrice = (product) => {
    const price = product.pricing?.discountedPrice || product.pricing?.basePrice || 0;
    return price ? `₹${price.toLocaleString("en-IN")}` : "₹0";
  };

  const updateScrollButtons = () => {
    const container = document.getElementById('recommended-carousel');
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
  };

  const scroll = (direction) => {
    const container = document.getElementById('recommended-carousel');
    if (!container) return;
    
    const scrollAmount = 320;
    const newPosition = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 300);
  };

  useEffect(() => {
    updateScrollButtons();
    const container = document.getElementById('recommended-carousel');
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, [products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#832729]"></div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="relative">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Carousel Container */}
      <div
        id="recommended-carousel"
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/products/${product.categorySlug}/${product.subCategorySlug}/${product.slug}`)}
            className="flex-shrink-0 w-72 bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer group border border-gray-200 hover:border-[#832729]"
          >
            <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-100">
              <img
                src={product.images?.[0] || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {product.pricing?.discountedPrice && product.pricing.discountedPrice < product.pricing.basePrice && (
                <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                  {Math.round(((product.pricing.basePrice - product.pricing.discountedPrice) / product.pricing.basePrice) * 100)}% OFF
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-serif text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[#832729] transition-colors">
                {product.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xl font-bold text-gray-900">{formatPrice(product)}</span>
                {product.pricing?.discountedPrice && product.pricing.discountedPrice < product.pricing.basePrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.pricing.basePrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {product.details?.metal && <span>{product.details.metal}</span>}
                {product.details?.metalPurity && (
                  <>
                    <span>•</span>
                    <span>{product.details.metalPurity}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      )}
    </div>
  );
};

export default ProductDetailPage;