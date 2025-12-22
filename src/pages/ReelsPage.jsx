import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Volume2, VolumeX, Share2, Heart, MessageCircle, ArrowLeft, ShoppingCart } from 'lucide-react';

const ReelsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const observerRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('reels-page-active');
    const initialIndex = location.state?.startIndex || 0;
    setCurrentIndex(initialIndex);
    fetchReels();

    return () => {
      document.body.classList.remove('reels-page-active');
    };
  }, [location.state]);

  useEffect(() => {
    if (reels.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          const index = parseInt(video.dataset.index);

          if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
            setCurrentIndex(index);
            video.muted = isMuted;
            video.play().catch(() => {});
          } else {
            video.pause();
            video.currentTime = 0;
          }
        });
      },
      {
        threshold: [0, 0.75, 1],
        rootMargin: '0px',
      }
    );

    videoRefs.current.forEach((video) => {
      if (video) {
        observerRef.current.observe(video);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [reels, isMuted]);

  useEffect(() => {
    if (reels.length > 0 && currentIndex >= 0 && containerRef.current) {
      const targetVideo = videoRefs.current[currentIndex];
      if (targetVideo) {
        setTimeout(() => {
          targetVideo.scrollIntoView({ behavior: 'auto', block: 'start' });
        }, 100);
      }
    }
  }, [reels]);

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
      // Use the /products/sku/:sku endpoint instead of /products/:id
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/products/sku/${productSku}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Product data fetched:', productSku, data);
        if (data.success && data.data) {
          setProductData(prev => ({
            ...prev,
            [productSku]: data.data
          }));
        } else if (data && !data.success) {
          // Handle case where API returns product directly without success wrapper
          setProductData(prev => ({
            ...prev,
            [productSku]: data
          }));
        }
      } else {
        console.error(`Product not found: ${productSku}`);
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
    navigate('/login');
    return;
  }

  setAddingToCart(prev => ({ ...prev, [reelId]: true }));

  try {
    const payload = {
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,

      // price logic (matches cart + inventory logic)
      price:
        product.pricing?.discountedPrice ??
        product.pricing?.basePrice ??
        0,

      quantity: 1,

      // used in Cart UI
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
  }
};



  const handleClose = () => {
    navigate(-1);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = !isMuted;
      }
    });
  };

  const handleShare = async (reel) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.title,
          text: reel.description,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Share cancelled');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="reels-page-loading">
        <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="reels-page-loading">
        <p className="text-white">No reels available</p>
        <button onClick={handleClose} className="mt-4 text-white underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="reels-page" ref={containerRef}>
      <button onClick={handleClose} className="reels-page-back" aria-label="Go back">
        <ArrowLeft size={24} className="text-white" />
      </button>

      <div className="reels-page-container">
        {reels.map((reel, index) => {
          const product = reel.ctaType === 'product' && reel.ctaSlug ? productData[reel.ctaSlug] : null;
          const isAddingToCart = addingToCart[reel.id];
          const shouldShowProductCTA = reel.ctaType === 'product' && reel.ctaSlug;
          
          return (
            <div key={reel.id} className="reels-page-item">
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                data-index={index}
                src={reel.videoUrl}
                className="reels-page-video"
                loop
                muted={isMuted}
                playsInline
                preload="auto"
              />

              <div className="reels-page-gradient" />

              <button onClick={handleClose} className="reels-page-exit" aria-label="Close reels">
                <X size={20} className="text-white" />
              </button>

              <div className="reels-page-actions">
                <button onClick={toggleMute} className="reels-page-action-btn" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted ? <VolumeX size={32} /> : <Volume2 size={32} />}
                </button>

                <button onClick={() => handleShare(reel)} className="reels-page-action-btn" aria-label="Share">
                  <Share2 size={24} />
                </button>
              </div>

              {shouldShowProductCTA ? (
                <div className="reels-product-card">
                  {product ? (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
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
                          <h3 className="text-white font-semibold text-sm line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-white/90 text-lg font-bold mt-1">
                            ₹{(product.pricing?.discountedPrice || product.pricing?.basePrice || product.price || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleAddToCart(product, reel.id)}
                        disabled={isAddingToCart}
                        className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        {isAddingToCart ? (
                          <>
                            <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={20} />
                            {reel.ctaText}
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-16 h-16 rounded-lg bg-white/20 flex-shrink-0 animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-white/20 rounded animate-pulse mb-2" />
                          <div className="h-5 bg-white/20 rounded w-24 animate-pulse" />
                        </div>
                      </div>
                      <div className="w-full bg-white/20 py-3 rounded-lg animate-pulse" />
                    </>
                  )}
                </div>
              ) : (
                <div className="reels-page-info">
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {reel.title}
                  </h3>
                  {reel.description && (
                    <p className="text-white/90 text-sm mb-3 line-clamp-2">
                      {reel.description}
                    </p>
                  )}
                  {reel.ctaText && reel.ctaLink && (
                    <button 
                      onClick={() => navigate(reel.ctaLink)}
                      className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      {reel.ctaText}
                    </button>
                  )}
                </div>
              )}

              {index === 0 && (
                <div className="reels-page-scroll-hint">
                  <div className="scroll-arrow">↓</div>
                  <span>Scroll for more</span>
                </div>
              )}

              <div className="reels-page-counter">
                {index + 1} / {reels.length}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReelsPage;