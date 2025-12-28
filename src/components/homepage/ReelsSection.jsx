import React, { useState, useEffect, useRef } from 'react';
import { Play, ChevronLeft, ChevronRight, ShoppingCart, Volume2, VolumeX } from 'lucide-react';
import {useNavigate} from 'react-router-dom';

const ReelsSection = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [stackMode, setStackMode] = useState('spread');
  const [productData, setProductData] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [isMuted, setIsMuted] = useState(true);
  const stackRef = useRef(null);
  const videoRef = useRef(null);
  const carouselRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetchReels();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      const t = setTimeout(() => setStackMode('stack'), 450);
      return () => clearTimeout(t);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!stackRef.current || isMobile) return;
    
    const vids = stackRef.current.querySelectorAll('video');
    vids.forEach(v => {
      try {
        if (v !== videoRef.current) {
          v.pause();
          v.currentTime = 0;
        }
      } catch (e) {}
    });
    
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
    }
  }, [reels, stackMode, isMobile, isMuted]);

  const fetchReels = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/reels`);
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          const activeReels = data.map(reel => ({
            id: reel.id,
            videoUrl: reel.videoUrl,
            title: reel.title || 'Diamond Jewellery',
            description: reel.description || reel.subtitle || '',
            duration: reel.duration || 45,
            isActive: reel.isActive,
            ctaType: reel.ctaType,
            ctaLink: reel.ctaLink,
            ctaSlug: reel.ctaSlug,
            ctaText: reel.ctaText || 'Add to Cart'
          }));
          
          setReels(activeReels);
          
          activeReels.forEach(reel => {
            if (reel.ctaType === 'product' && reel.ctaSlug) {
              fetchProductData(reel.ctaSlug);
            }
          });
        } else {
          loadLocalReels();
        }
      } else {
        loadLocalReels();
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
      loadLocalReels();
    } finally {
      setLoading(false);
    }
  };

  const fetchProductData = async (productSku) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/products/sku/${productSku}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setProductData(prev => ({
            ...prev,
            [productSku]: data.data
          }));
        } else if (data && !data.success) {
          setProductData(prev => ({
            ...prev,
            [productSku]: data
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const loadLocalReels = () => {
    const localReels = [
      {
        id: 'reel-local-1',
        videoUrl: 'https://res.cloudinary.com/dxoxbnptl/video/upload/v1765112697/video1_hieygd.mp4',
        title: 'Diamond Styling Tips',
        description: 'Exquisite Vines Diamond Necklace Set',
        duration: 45,
        isActive: true,
        ctaType: 'none',
        ctaText: 'Shop Now'
      },
      {
        id: 'reel-local-2',
        videoUrl: 'https://res.cloudinary.com/dxoxbnptl/video/upload/v1765112696/video3_miynta.mp4',
        title: 'Elegant Diamond Jewellery',
        description: 'Every Day Diamond Collection',
        duration: 60,
        isActive: true,
        ctaType: 'none',
        ctaText: 'Shop Now'
      },
      {
        id: 'reel-local-3',
        videoUrl: 'https://res.cloudinary.com/dxoxbnptl/video/upload/v1765112694/video2_a54fyn.mp4',
        title: 'Precious Necklace Jewellery',
        description: 'Precious Stones Collection',
        duration: 60,
        isActive: true,
        ctaType: 'none',
        ctaText: 'Shop Now'
      },
    ];
    setReels(localReels);
  };

  const handleAddToCart = async (product, reelId) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please login to add items to cart');
      return;
    }

    setAddingToCart(prev => ({ ...prev, [reelId]: true }));

    try {
      const payload = {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        price: product.pricing?.discountedPrice ?? product.pricing?.basePrice ?? 0,
        quantity: 1,
        product_image: product.images?.[0] || null,
      };

      const response = await fetch(
        `${import.meta.env.VITE_APP_BASE_URL}/cart/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok && data.success !== false) {
        alert('✓ Added to cart successfully!');
      } else {
        alert(data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart. Please try again.');
    } finally {
      setAddingToCart(prev => ({ ...prev, [reelId]: false }));
      navigate('/cart');
    }
  };

  const openReelsPage = (index) => {
    console.log('Navigate to reels page with index:', index);
    navigate(`/reels?highlight=${index}`);
  };

  const goToNextReel = () => {
    setReels(prev => {
      if (!prev || prev.length === 0) return prev;
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  const goToPreviousReel = () => {
    setReels(prev => {
      if (!prev || prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, prev.length - 1);
      return [last, ...rest];
    });
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const getStackPosition = (index) => {
    const spreadXs = [-420, -270, 0, 270, 420];
    const stackXs = [-240, -120, 0, 120, 240];
    const spreadYs = [-70, -35, 0, 35, 70];
    const stackYs = [-20, -12, 0, -12, -20];
    const rotates = [0, 0, 0, 0, 0];
    const scales = [0.78, 0.88, 0.98, 0.88, 0.78];
    const zIndices = [5, 25, 60, 25, 5];

    const x = stackMode === 'spread' ? (spreadXs[index] ?? 0) : (stackXs[index] ?? 0);
    const y = stackMode === 'spread' ? (spreadYs[index] ?? 0) : (stackYs[index] ?? 0);
    const rotate = rotates[index] ?? 0;
    const scale = scales[index] ?? 0.8;
    const zIndex = zIndices[index] ?? 0;
    return { rotate, scale, zIndex, x, y };
  };

  const handleReelClick = (e, actualReelIndex, hasProduct) => {
    if (hasProduct) {
      const target = e.target;
      const ctaContainer = target.closest('.cta-container');
      if (ctaContainer) {
        return;
      }
    }
    openReelsPage(actualReelIndex);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-12 w-96 max-w-full bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-full max-w-[600px] bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (reels.length === 0) return null;

  return (
    <>
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        /* Mobile carousel - EXACTLY like RecommendedProductsCarousel */
        .reels-mobile-carousel {
          display: flex;
          flex-wrap: nowrap;
          gap: 16px;
          overflow-x: auto;
          overflow-y: visible;
          padding: 0 20px 16px 20px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
          /* CRITICAL: Allow both horizontal and vertical touch */
          touch-action: pan-x pan-y;
        }
        
        .reels-mobile-carousel::-webkit-scrollbar {
          display: none;
        }
        
        .reels-card-mobile {
          flex-shrink: 0;
          width: 220px;
          height: 390px;
          cursor: pointer;
          scroll-snap-align: start;
          /* Allow touch to pass through for vertical scroll */
          touch-action: auto;
        }
        
        /* Prevent videos from blocking scroll */
        .reels-card-mobile video {
          pointer-events: none;
          user-select: none;
          -webkit-user-select: none;
          touch-action: none;
        }
        
        /* Card overlay and background should not capture touch */
        .reels-card-mobile > div:first-child {
          pointer-events: none;
          touch-action: none;
        }
        
        /* Only interactive elements capture touch */
        .reels-card-mobile .cta-container,
        .reels-card-mobile button {
          pointer-events: auto;
          touch-action: auto;
        }
      `}</style>
      
      <section className="reels-section py-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 " />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-[#10254b] md:text-5xl font-serif text-gray-900 mb-3">
              Styling 101 With Diamonds
            </h2>
            <p className="text-xl text-gray-600 text-[#1a3974ff] font-light">
              Trendsetting diamond jewellery suited for every occasion
            </p>
          </div>

          {!isMobile && (
            <div className="relative max-w-6xl mx-auto px-16 md:px-20">
              {reels.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousReel}
                    className="absolute left-0 md:left-2 top-[45%] md:top-1/2 -translate-y-1/2 z-[70] w-12 h-12 md:w-16 md:h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-xl hover:scale-110 border-2 border-gray-200"
                    aria-label="Previous reel"
                  >
                    <ChevronLeft size={28} className="text-gray-900 stroke-[2.5]" />
                  </button>

                  <button
                    onClick={goToNextReel}
                    className="absolute right-0 md:right-2 top-[45%] md:top-1/2 -translate-y-1/2 z-[70] w-12 h-12 md:w-16 md:h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-xl hover:scale-110 border-2 border-gray-200"
                    aria-label="Next reel"
                  >
                    <ChevronRight size={28} className="text-gray-900 stroke-[2.5]" />
                  </button>
                </>
              )}

              <div ref={stackRef} className="relative h-[550px] max-w-md mx-auto perspective-1000" onClick={()=>{navigate('/reels')}}>
                {Array.from({ length: 5 }).map((_, index) => {
                  const centerSlot = 2;
                  const reel = reels.length > 0 ? reels[(index - centerSlot + reels.length) % reels.length] : undefined;
                  const position = getStackPosition(index);
                  const actualReelIndex = (index - centerSlot + reels.length) % reels.length;
                  const product = reel?.ctaType === 'product' && reel?.ctaSlug ? productData[reel.ctaSlug] : null;
                  const isAddingToCart = addingToCart[reel?.id];
                  
                  return (
                    <div
                      key={`${reel?.id ?? 'placeholder'}-${index}`}
                      onClick={(e) => handleReelClick(e, actualReelIndex, !!product)}
                      className="absolute inset-0 cursor-pointer transition-all duration-700 ease-out"
                      style={{
                        transform: `translateX(${position.x}px) translateY(${position.y ?? 0}px) scale(${position.scale}) rotate(${position.rotate}deg)`,
                        zIndex: position.zIndex,
                        transformOrigin: 'center center',
                      }}
                    >
                      <div style={{ width: '300px', height: '100%', margin: '0 auto' }} className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow">
                        {reel ? (
                          <video
                            ref={index === 2 ? videoRef : undefined}
                            src={reel.videoUrl}
                            className="w-full h-full object-cover pointer-events-none"
                            preload="metadata"
                            muted={index === 2 ? isMuted : true}
                            playsInline
                            loop
                            autoPlay={index === 2}
                          />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <div className="w-3/4 h-3/4 bg-white/10 rounded-2xl border border-white/6" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

                        {index === 2 && (
                          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-2 pointer-events-none">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              <span className="text-white text-sm font-medium">Live</span>
                            </div>
                            <button
  onClick={(e) => {
    e.stopPropagation();
    toggleMute();
  }}
  className="relative w-10 h-10 rounded-full 
             bg-black/70 hover:bg-black/90 
             flex items-center justify-center
             transition-all
             z-50"
>
  <span className="absolute inset-0 flex items-center justify-center">
    {isMuted ? (
      <VolumeX
        size={22}
        strokeWidth={2.5}
        className="text-white"
      />
    ) : (
      <Volume2
        size={22}
        strokeWidth={2.5}
        className="text-white"
      />
    )}
  </span>
</button>

                          </div>
                        )}

                        {index === 2 && product && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[276px] cta-container pointer-events-auto" >
                            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                  {product.images && product.images.length > 0 ? (
                                    <img 
                                      src={product.images[0]} 
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200" />
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-gray-900 font-semibold text-[11px] leading-tight line-clamp-1">
                                    {product.name}
                                  </h3>
                                  <div className="flex items-baseline gap-1.5 mt-0.5">
                                    <p className="text-gray-900 text-sm font-bold whitespace-nowrap">
                                      ₹{(product.pricing?.discountedPrice || product.pricing?.basePrice || product.price || 0).toLocaleString('en-IN')}
                                    </p>
                                    {product.pricing?.basePrice && product.pricing?.basePrice > (product.pricing?.discountedPrice || 0) && (
                                      <p className="text-gray-500 text-[9px] line-through whitespace-nowrap">
                                        ₹{product.pricing.basePrice.toLocaleString('en-IN')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product, reel.id);
                                }}
                                disabled={isAddingToCart}
                                className="w-full bg-gray-900 text-white font-semibold py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isAddingToCart ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span className="whitespace-nowrap">Adding...</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart size={15} />
                                    <span className="whitespace-nowrap">{reel.ctaText}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {index === 2 && !product && reel && (
                          <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                            <h3 className="text-white font-semibold text-xl mb-1">
                              {reel.title}
                            </h3>
                            <p className="text-white/90 text-sm">
                              {reel.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full transition-all ${
                        index === 2 ? 'w-12' : 'w-8'
                      } ${index === 2 ? 'bg-gray-900' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {isMobile && (
            <div className="w-full">
              <div 
                ref={carouselRef} 
                className="reels-mobile-carousel"
                style={{
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {[...reels, ...reels, ...reels].map((reel, index) => {
                  const product = reel.ctaType === 'product' && reel.ctaSlug ? productData[reel.ctaSlug] : null;
                  const isAddingToCart = addingToCart[reel.id];
                  
                  return (
                    <div
                      key={`${reel.id}-${index}`}
                      onClick={(e) => handleReelClick(e, index % reels.length, !!product)}
                      className="reels-card-mobile"
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
                        <video
                          src={reel.videoUrl}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted={isMuted}
                          playsInline
                          loop
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
                        
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Play size={24} className="text-white ml-1" fill="white" />
                          </div>
                        </div>
                        
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsMuted(prev => !prev);
                            }}
                            className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-all pointer-events-auto"
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted ? (
                              <VolumeX size={16} className="text-white" />
                            ) : (
                              <Volume2 size={16} className="text-white" />
                            )}
                          </button>
                        </div>

                        {product ? (
                          <div className="absolute bottom-0 left-0 right-0 cta-container pointer-events-auto">
                            <div className="bg-white/30 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-white/40">
                              <div className="flex items-center gap-2.5 mb-2">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  {product.images && product.images.length > 0 ? (
                                    <img 
                                      src={product.images[0]} 
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200" />
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-gray-900 font-semibold text-xs line-clamp-1">
                                    {product.name}
                                  </h3>
                                  <p className="text-gray-900 text-sm font-bold">
                                    ₹{(product.pricing?.discountedPrice || product.pricing?.basePrice || product.price || 0).toLocaleString('en-IN')}
                                  </p>
                                  {product.pricing?.basePrice && product.pricing?.basePrice > (product.pricing?.discountedPrice || 0) && (
                                    <p className="text-gray-500 text-[10px] line-through">
                                      ₹{product.pricing.basePrice.toLocaleString('en-IN')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product, reel.id);
                                }}
                                disabled={isAddingToCart}
                                className="w-full bg-gray-900 text-white font-semibold py-1.5 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isAddingToCart ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart size={14} />
                                    {reel.ctaText}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                            <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                              {reel.title}
                            </h3>
                            <p className="text-white/90 text-xs line-clamp-2">
                              {reel.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ReelsSection;