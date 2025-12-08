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
      <div className="relative w-full h-[calc(100vh-120px)] md:h-[380px] lg:h-[450px] bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50">
      <div 
        className="relative w-full h-[calc(100vh-120px)] md:h-[380px] lg:h-[450px] flex items-center justify-center px-3 py-3 md:py-3 md:px-3"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background decoration - Hidden on mobile */}
        <div className="absolute inset-0 opacity-10 pointer-events-none hidden md:block">
          <div className="absolute top-8 left-8 w-28 h-28 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 blur-3xl" />
          <div className="absolute bottom-8 right-8 w-36 h-36 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 blur-3xl" />
        </div>

        {/* Container for all banners */}
        <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center md:gap-3 lg:gap-4">
          {/* Left Banner (Previous) - Hidden on mobile and tablet */}
          {banners.length > 1 && (
            <div className="w-[15%] h-[85%] opacity-25 hidden xl:block flex-shrink-0 transform hover:opacity-35 transition-opacity">
              <img
                src={banners[(currentIndex - 1 + banners.length) % banners.length].imageUrl}
                alt=""
                className="w-full h-full object-cover rounded-xl blur-sm scale-95 hover:scale-100 transition-transform duration-700"
              />
            </div>
          )}

          {/* Main Banner (Current) */}
          <div className="relative w-full h-full xl:w-[70%] flex-shrink-0">
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
                    className="w-full h-full object-cover rounded-lg md:rounded-lg md:shadow-xl"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </picture>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 rounded-lg" />

                {/* Overlay Content */}
                {(banner.title || banner.subtitle || banner.ctaText) && (
                  <div className="absolute inset-0 flex items-center md:items-center">
                    <div className="w-full px-6 md:px-10 lg:px-14">
                      <div className="max-w-xl">
                        {banner.title && (
                          <h1 className="text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-3 animate-fadeIn text-white drop-shadow-2xl" style={{ fontFamily: 'serif' }}>
                            {banner.title}
                          </h1>
                        )}
                        {banner.subtitle && (
                          <p className="text-base md:text-lg lg:text-xl xl:text-2xl mb-5 md:mb-6 animate-fadeIn delay-100 italic text-amber-100 drop-shadow-lg" style={{ fontFamily: 'cursive' }}>
                            {banner.subtitle}
                          </p>
                        )}
                        {banner.ctaText && banner.ctaLink && (
                          <button
                            onClick={() => window.location.href = banner.ctaLink}
                            className="group relative bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 md:px-8 py-3 md:py-3 text-sm md:text-base font-bold uppercase tracking-wider hover:from-amber-700 hover:to-amber-800 transition-all transform hover:scale-105 animate-fadeIn delay-200 shadow-lg border border-amber-500 rounded-lg overflow-hidden"
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
                className="w-full h-full object-cover rounded-xl blur-sm scale-95 hover:scale-100 transition-transform duration-700"
              />
            </div>
          )}

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-amber-700 p-2.5 md:p-2.5 rounded-full shadow-xl transition-all hover:scale-110 backdrop-blur-sm z-10"
                aria-label="Previous banner"
              >
                <ChevronLeft className="w-6 h-6 md:w-5 md:h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-amber-700 p-2.5 md:p-2.5 rounded-full shadow-xl transition-all hover:scale-110 backdrop-blur-sm z-10"
                aria-label="Next banner"
              >
                <ChevronRight className="w-6 h-6 md:w-5 md:h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navigation dots */}
      {banners.length > 1 && (
        <div className="relative pb-4 md:pb-5 pt-2 md:pt-2">
          <div className="flex justify-center gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to banner ${index + 1}`}
                className={`w-2.5 h-2.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ease-out
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