import React from 'react';
import { Star, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    id: 1,
    customerName: 'Ananya Sharma',
    customerAvatar: null,
    rating: 5,
    reviewText: 'The gemstone bead necklace I bought is absolutely gorgeous. The colors are rich and the finishing feels very premium.',
    date: '2024-01-16',
    isVerified: true
  },
  {
    id: 2,
    customerName: 'Priya Mehta',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Loved the traditional bead necklace. It looks elegant and is perfect for both daily wear and festive occasions.',
    date: '2024-01-13',
    isVerified: true
  },
  {
    id: 3,
    customerName: 'Neha Kapoor',
    customerAvatar: null,
    rating: 5,
    reviewText: 'The gemstone necklace set is even more beautiful in real life. The quality of beads and polish is excellent.',
    date: '2024-01-10',
    isVerified: true
  },
  {
    id: 4,
    customerName: 'Kavita Joshi',
    customerAvatar: null,
    rating: 4,
    reviewText: 'Very elegant designs and genuine gemstones. The necklace feels comfortable and well-balanced when worn.',
    date: '2024-01-08',
    isVerified: true
  },
  {
    id: 5,
    customerName: 'Ritu Malhotra',
    customerAvatar: null,
    rating: 5,
    reviewText: 'I really appreciate the transparency in pricing. The bead necklace looks classy and is beautifully crafted.',
    date: '2024-01-05',
    isVerified: true
  },
  {
    id: 6,
    customerName: 'Sonal Desai',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Amazing collection of gemstone and bead jewellery. Perfect finishing and great attention to detail.',
    date: '2023-12-31',
    isVerified: true
  }
];


const ReviewsCarousel = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(false);
  const autoPlayRef = React.useRef(null);

  // Check screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-play functionality for mobile
  React.useEffect(() => {
    if (isAutoPlaying && isMobile) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }, 4000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, isMobile]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

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

  // Desktop: Infinite vertical scroll
  const [translateY, setTranslateY] = React.useState(0);
  const animationRef = React.useRef(null);

  React.useEffect(() => {
    if (!isMobile) {
      const cardHeight = 360;
      const gap = 32;
      const totalHeight = (cardHeight + gap) * reviews.length;
      
      let currentTranslate = 0;
      
      const animate = () => {
        currentTranslate -= 0.4;
        
        if (Math.abs(currentTranslate) >= totalHeight) {
          currentTranslate = 0;
        }
        setTranslateY(currentTranslate);
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isMobile]);

  const extendedReviews = [...reviews, ...reviews, ...reviews];

  const ReviewCard = ({ review, className = "" }) => (
    <div 
      className={`review-card rounded-3xl p-6 md:p-8 flex flex-col justify-between backdrop-blur-md ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
        border: '2px solid black',
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
                background: 'linear-gradient(135deg, #10254b 0%, #18356cff 100%)',
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
  );

  return (
    <section className="min-h-screen lg:h-screen relative overflow-hidden">
      {/* Dark gradient overlay */}
      <div className="absolute inset-0" />
      
      <div className="container mx-auto px-4 min-h-screen lg:h-screen relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center min-h-screen lg:h-screen py-8 lg:py-0">
          {/* Left Section - Header */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h2
  className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-4 lg:mb-6 leading-tight"
  style={{
    color: '#10254b',
    textShadow: `
      -1.5px -1.5px 0 #ffffff,
       1.5px -1.5px 0 #ffffff,
      -1.5px  1.5px 0 #ffffff,
       1.5px  1.5px 0 #ffffff,
       0px  0px 6px #ffffff
    `
  }}
>
  What Our<br />Customers Say
</h2>
            <p
  className="text-lg md:text-xl lg:text-2xl font-light"
  style={{
    color: '#073797ff',
   
  }}
>
  Trusted by thousands of happy customers
</p>

          </div>
          {/* Right Section - Carousel */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            {isMobile ? (
              // MOBILE: Hero Carousel Style - One card with transitions
              <div className="relative w-full max-w-md">
                <div className="relative h-[420px] flex items-center justify-center px-8">
                  {/* Cards Container */}
                  <div className="relative w-full h-full">
                    {reviews.map((review, index) => (
                      <div
                        key={review.id}
                        className={`absolute inset-0 transition-all duration-1000 ${
                          index === currentIndex 
                            ? 'opacity-100 scale-100 z-10' 
                            : 'opacity-0 scale-95 z-0'
                        }`}
                      >
                        <ReviewCard review={review} />
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                 
                </div>

                {/* Dots Indicator */}
                {reviews.length > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {reviews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-300 rounded-full ${
                          index === currentIndex 
                            ? 'w-8 h-2 bg-[#10254b] hover:w-10 hover:bg-[#10254b]' 
                            : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`Go to review ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // DESKTOP: Vertical infinite scroll
              <div className="overflow-hidden flex items-center h-screen">
                <div 
                  className="flex flex-col bg-white gap-8"
                  style={{
                    transform: `translateY(${translateY}px)`,
                    willChange: 'transform'
                  }}
                >
                  {extendedReviews.map((review, idx) => (
                    <ReviewCard 
                      key={`${review.id}-${idx}`} 
                      review={review} 
                      className="w-96 flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;