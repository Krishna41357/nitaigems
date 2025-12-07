import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

const reviews = [
  {
    id: 1,
    customerName: 'Sarah Johnson',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Absolutely in love with my new diamond necklace! The craftsmanship is exquisite and the sparkle is incredible.',
    date: '2024-01-15',
    isVerified: true
  },
  {
    id: 2,
    customerName: 'Michael Chen',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Exceptional quality and service. The staff helped me find the perfect engagement ring. My fiancée is over the moon!',
    date: '2024-01-10',
    isVerified: true
  },
  {
    id: 3,
    customerName: 'Emma Williams',
    customerAvatar: null,
    rating: 4,
    reviewText: 'Beautiful collection of jewelry. The gold hallmark certification gives me confidence in my purchase.',
    date: '2024-01-08',
    isVerified: true
  },
  {
    id: 4,
    customerName: 'David Brown',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Bought a ruby pendant for my wife. The stone certification and lifetime maintenance service are excellent.',
    date: '2024-01-05',
    isVerified: true
  },
  {
    id: 5,
    customerName: 'Lisa Anderson',
    customerAvatar: null,
    rating: 5,
    reviewText: 'The diamond earrings I purchased are stunning! The transparency in pricing and quality is commendable.',
    date: '2024-01-03',
    isVerified: true
  },
  {
    id: 6,
    customerName: 'James Taylor',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Outstanding experience from start to finish. The ethical sourcing and craftsmanship make this jewelry truly special.',
    date: '2023-12-28',
    isVerified: true
  }
];

const ReviewsCarousel = () => {
  const [translateY, setTranslateY] = React.useState(0);
  const [translateX, setTranslateX] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(false);
  const animationRef = React.useRef(null);

  // Create an extended array for infinite loop effect
  const extendedReviews = [...reviews, ...reviews, ...reviews];

  // Check screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    const cardHeight = 360;
    const cardWidth = 384; // w-96 = 384px
    const gap = 32; // gap-8 = 32px
    const totalHeightDesktop = (cardHeight + gap) * reviews.length;
    const totalWidthMobile = (cardWidth + gap) * reviews.length;
    
    let currentTranslate = 0;
    
    const animate = () => {
      currentTranslate -= 0.4; // Smooth scroll speed
      
      if (isMobile) {
        // Horizontal scroll for mobile
        if (Math.abs(currentTranslate) >= totalWidthMobile) {
          currentTranslate = 0;
        }
        setTranslateX(currentTranslate);
      } else {
        // Vertical scroll for desktop
        if (Math.abs(currentTranslate) >= totalHeightDesktop) {
          currentTranslate = 0;
        }
        setTranslateY(currentTranslate);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMobile]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 60) return '1 month ago';
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <section className="min-h-screen lg:h-screen relative overflow-hidden">
      {/* High-quality background image using img tag */}
      <img 
        src="https://res.cloudinary.com/dxoxbnptl/image/upload/v1765110920/bg7_ulxrnt.jpg" 
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          imageRendering: 'high-quality',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      />
      {/* Dark gradient overlay on left for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
      
      <div className="container mx-auto px-4 min-h-screen lg:h-screen relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center min-h-screen lg:h-screen py-8 lg:py-0">
          {/* Left Section - Header */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h2
              className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-white mb-4 lg:mb-6 leading-tight"
              style={{
                textShadow: `
                  -2px -2px 0 #000,
                   2px -2px 0 #000,
                  -2px  2px 0 #000,
                   2px  2px 0 #000,
                   0px  0px 8px rgba(0,0,0,0.6)
                `
              }}
            >
              What Our<br/>Customers Say
            </h2>

            <p
              className="text-white text-lg md:text-xl lg:text-2xl font-light"
              style={{
                textShadow: `
                  -1px -1px 0 #000,
                   1px -1px 0 #000,
                  -1px  1px 0 #000,
                   1px  1px 0 #000,
                   0px  0px 6px rgba(0,0,0,0.5)
                `
              }}
            >
              Trusted by thousands of happy customers
            </p>
          </div>

          {/* Right Section - Carousel (Vertical on desktop, Horizontal on mobile) */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <div className={`overflow-hidden flex items-center ${isMobile ? 'w-full' : 'h-screen'}`}>
              <div 
                className={`flex gap-8 ${isMobile ? 'flex-row' : 'flex-col'}`}
                style={{
                  transform: isMobile 
                    ? `translateX(${translateX}px)` 
                    : `translateY(${translateY}px)`
                }}
              >
                {extendedReviews.map((review, idx) => (
                  <div 
                    key={`${review.id}-${idx}`}
                    className="review-card rounded-3xl p-6 md:p-8 w-80 md:w-96 flex flex-col justify-between backdrop-blur-md flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      minHeight: '360px'
                    }}
                  >
                    <div>
                      {/* Avatar and Name */}
                      <div className="flex items-center mb-4 md:mb-6">
                        {review.customerAvatar ? (
                          <img
                            src={review.customerAvatar}
                            alt={review.customerName}
                            className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover ring-4 ring-white/60"
                            style={{
                              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        ) : (
                          <div 
                            className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg ring-4 ring-white/60"
                            style={{
                              background: 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 100%)',
                              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            {getInitials(review.customerName)}
                          </div>
                        )}
                        <div className="ml-3 md:ml-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-base md:text-lg text-gray-900">
                              {review.customerName}
                            </h4>
                            {review.isVerified && (
                              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                            )}
                          </div>
                          {review.isVerified && (
                            <p className="text-xs text-emerald-600 font-semibold">Verified Purchase</p>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex mb-4 md:mb-5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 md:w-5 md:h-5 ${
                              i < review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300 fill-gray-300'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Review Text */}
                      <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4 md:mb-5 font-normal">
                        {review.reviewText}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-200/50">
                      <p className="text-xs md:text-sm text-gray-500 font-medium">
                        {getRelativeTime(review.date)}
                      </p>
                      <div className="w-8 h-1 rounded-full bg-gradient-to-r from-gray-300 to-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;