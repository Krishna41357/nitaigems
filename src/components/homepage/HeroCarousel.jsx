import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/banners`);
      if (response.ok) {
        const data = await response.json();
        const activeBanners = data
          .filter(banner => banner.isActive)
          .sort((a, b) => a.order - b.order);
        
        if (activeBanners.length > 0) {
          setBanners(activeBanners);
        } else {
          loadLocalBanners();
        }
      } else {
        loadLocalBanners();
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      loadLocalBanners();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalBanners = () => {
    const localBanners = [
      {
        id: `local-banner-1-${Date.now()}`,
        imageUrl: 'https://res.cloudinary.com/dxoxbnptl/image/upload/v1765112672/banner3_fdtnxs.jpg',
        mobileImageUrl: 'https://res.cloudinary.com/dxoxbnptl/image/upload/v1765112672/banner3_fdtnxs.jpg',
        title: 'Exquisite Diamond Collection',
        subtitle: 'Discover timeless elegance',
        ctaText: 'Shop Now',
        ctaLink: '/collections',
        order: 1,
        isActive: true,
      },
      {
        id: `local-banner-2-${Date.now()}-1`,
        imageUrl: 'https://res.cloudinary.com/dxoxbnptl/image/upload/v1765112673/banner2_cwmsnw.jpg',
        mobileImageUrl: '',
        title: 'New Arrivals',
        subtitle: 'Trending diamond jewellery',
        ctaText: 'Explore',
        ctaLink: '/new-arrivals',
        order: 2,
        isActive: true,
      },
      {
        id: `local-banner-3-${Date.now()}-2`,
        imageUrl: 'https://res.cloudinary.com/dxoxbnptl/image/upload/v1765112672/banner3_fdtnxs.jpg',
        mobileImageUrl: '',
        title: 'New Arrivals',
        subtitle: 'Trending diamond jewellery',
        ctaText: 'Explore',
        ctaLink: '/new-arrivals',
        order: 3,
        isActive: true,
      },
      {
        id: `local-banner-4-${Date.now()}-3`,
        imageUrl: 'https://res.cloudinary.com/dxoxbnptl/image/upload/v1765112673/banner2_cwmsnw.jpg',
        mobileImageUrl: '',
        title: 'New Arrivals',
        subtitle: 'Trending diamond jewellery',
        ctaLink: '/new-arrivals',
        order: 4,
        isActive: true,
      },
    ];

    setBanners(localBanners);
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (banners.length === 0 || isPaused) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [banners.length, isPaused, nextSlide]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide]);

  if (loading) {
    return (
      <div className="relative w-full h-[250px] sm:h-[300px] md:h-[380px] lg:h-[450px] bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50">
      <div 
        className="relative w-full h-[250px] sm:h-[300px] md:h-[380px] lg:h-[450px] flex items-center justify-center py-2 sm:py-3 px-2 sm:px-3"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-4 sm:top-8 left-4 sm:left-8 w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 blur-2xl sm:blur-3xl" />
          <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 blur-2xl sm:blur-3xl" />
        </div>

        {/* Container for all banners - FIXED: Added max-w-7xl and proper centering */}
        <div className="relative w-full max-w-7xl mx-auto h-full flex items-center justify-center gap-2 sm:gap-3 lg:gap-4">
          {/* Left Banner (Previous) - Hidden on mobile and tablet */}
          {banners.length > 1 && (
            <div className="w-[15%] h-[85%] opacity-25 hidden xl:block flex-shrink-0 transform hover:opacity-35 transition-opacity">
              <img
                src={banners[(currentIndex - 1 + banners.length) % banners.length].imageUrl}
                alt=""
                className="w-full h-full object-cover rounded-lg sm:rounded-xl blur-sm scale-95 hover:scale-100 transition-transform duration-700"
              />
            </div>
          )}

          {/* Main Banner (Current) - FIXED: Better responsive sizing */}
          <div className="relative w-full xl:w-[70%] h-full flex-shrink-0">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-all duration-1000 ${
                  index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              >
                <picture>
                  <source
                    media="(max-width: 768px)"
                    srcSet={banner.mobileImageUrl || banner.imageUrl}
                  />
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || `Banner ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg shadow-lg sm:shadow-xl"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </picture>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 rounded-lg" />

                {/* Overlay Content - FIXED: Better responsive text sizing */}
                {(banner.title || banner.subtitle || banner.ctaText) && (
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14">
                      <div className="max-w-xl">
                        {banner.title && (
                          <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 animate-fadeIn text-white drop-shadow-2xl" style={{ fontFamily: 'serif' }}>
                            {banner.title}
                          </h1>
                        )}
                        {banner.subtitle && (
                          <p className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl mb-3 sm:mb-4 md:mb-6 animate-fadeIn delay-100 italic text-amber-100 drop-shadow-lg" style={{ fontFamily: 'cursive' }}>
                            {banner.subtitle}
                          </p>
                        )}
                        {banner.ctaText && banner.ctaLink && (
                          <button
                            onClick={() => window.location.href = banner.ctaLink}
                            className="group relative bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-bold uppercase tracking-wider hover:from-amber-700 hover:to-amber-800 transition-all transform hover:scale-105 animate-fadeIn delay-200 shadow-lg border border-amber-500 rounded-md sm:rounded-lg overflow-hidden"
                          >
                            <span className="relative z-10">{banner.ctaText}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Banner (Next) - Hidden on mobile and tablet */}
          {banners.length > 1 && (
            <div className="w-[15%] h-[85%] opacity-25 hidden xl:block flex-shrink-0 transform hover:opacity-35 transition-opacity">
              <img
                src={banners[(currentIndex + 1) % banners.length].imageUrl}
                alt=""
                className="w-full h-full object-cover rounded-lg sm:rounded-xl blur-sm scale-95 hover:scale-100 transition-transform duration-700"
              />
            </div>
          )}

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-amber-700 p-1.5 sm:p-2 md:p-2.5 rounded-full shadow-lg sm:shadow-xl transition-all hover:scale-110 backdrop-blur-sm z-10"
                aria-label="Previous banner"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-amber-700 p-1.5 sm:p-2 md:p-2.5 rounded-full shadow-lg sm:shadow-xl transition-all hover:scale-110 backdrop-blur-sm z-10"
                aria-label="Next banner"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navigation dots */}
      {banners.length > 1 && (
        <div className="relative pb-3 sm:pb-4 md:pb-5 pt-1 sm:pt-2">
          <div className="flex justify-center gap-1.5 sm:gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to banner ${index + 1}`}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ease-out
                  ${index === currentIndex 
                    ? 'bg-amber-600 scale-110' 
                    : 'bg-amber-300 hover:bg-amber-400 opacity-60 hover:opacity-100'
                  }`}
              />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;