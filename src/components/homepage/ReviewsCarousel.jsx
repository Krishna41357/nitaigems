import React from 'react';
import { Star, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    id: 1,
    customerName: 'Ananya Sharma',
    customerAvatar: null,
    rating: 5,
    reviewText: 'The Tanzanite Mala & Necklace Collection looks stunning. The beads are vibrant and feel truly premium.',
    date: '2026-01-18',
    isVerified: true
  },
  {
    id: 2,
    customerName: 'Priya Mehta',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Loved the Multi-Sapphire Mala. The color mix is elegant and perfect for festive wear.',
    date: '2026-01-15',
    isVerified: true
  },
  {
    id: 3,
    customerName: 'Neha Kapoor',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Ruby Mala & Necklace Collection is breathtaking. The polish and gemstone quality are excellent.',
    date: '2026-01-12',
    isVerified: true
  },
  {
    id: 4,
    customerName: 'Kavita Joshi',
    customerAvatar: null,
    rating: 4,
    reviewText: 'Emerald Mala looks graceful and luxurious. Very comfortable to wear.',
    date: '2026-01-10',
    isVerified: true
  },
  {
    id: 5,
    customerName: 'Ritu Malhotra',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Pearl Mala & Necklace Collection feels classy and timeless. Great craftsmanship.',
    date: '2026-01-08',
    isVerified: true
  },
  {
    id: 6,
    customerName: 'Sonal Desai',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Blue Sapphire Mala looks regal and elegant. Perfect for evening events.',
    date: '2026-01-06',
    isVerified: true
  },
  {
    id: 7,
    customerName: 'Isha Verma',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Morganite Mala is delicate, soft-colored, and absolutely beautiful.',
    date: '2025-12-22',
    isVerified: true
  },
  {
    id: 8,
    customerName: 'Pooja Nair',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Multi-Sapphire Necklace Collection has a rich and vibrant gemstone blend.',
    date: '2025-12-18',
    isVerified: true
  },
  {
    id: 9,
    customerName: 'Aarohi Singh',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Tanzanite Mala feels premium and unique. A statement piece.',
    date: '2025-12-15',
    isVerified: true
  },
  {
    id: 10,
    customerName: 'Meera Iyer',
    customerAvatar: null,
    rating: 4,
    reviewText: 'Emerald Necklace Collection is beautifully crafted and elegant.',
    date: '2025-12-10',
    isVerified: true
  },

  {
    id: 11,
    customerName: 'Shruti Patel',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Ruby Mala has a deep, rich tone. Perfect for traditional outfits.',
    date: '2025-11-28',
    isVerified: true
  },
  {
    id: 12,
    customerName: 'Tanvi Kulkarni',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Pearl Necklace Collection looks refined and elegant.',
    date: '2025-11-20',
    isVerified: true
  },
  {
    id: 13,
    customerName: 'Rhea Malhotra',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Blue Sapphire Mala gives a royal and luxurious feel.',
    date: '2025-11-15',
    isVerified: true
  },
  {
    id: 14,
    customerName: 'Nikita Rao',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Coral Mala & Necklace Collection is vibrant and beautifully polished.',
    date: '2025-11-10',
    isVerified: true
  },
  {
    id: 15,
    customerName: 'Simran Kaur',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Tanzanite Necklace Collection feels luxurious and rare.',
    date: '2025-11-05',
    isVerified: true
  },
  {
    id: 16,
    customerName: 'Aditi Khanna',
    customerAvatar: null,
    rating: 4,
    reviewText: 'Multi-Sapphire Mala looks colorful and premium.',
    date: '2025-10-30',
    isVerified: true
  },
  {
    id: 17,
    customerName: 'Bhavna Shah',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Emerald Necklace Collection is rich in color and finish.',
    date: '2025-10-25',
    isVerified: true
  },
  {
    id: 18,
    customerName: 'Kritika Sen',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Morganite Mala looks soft, feminine, and premium.',
    date: '2025-10-20',
    isVerified: true
  },
  {
    id: 19,
    customerName: 'Nisha Agarwal',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Ruby Mala is bold and eye-catching.',
    date: '2025-10-15',
    isVerified: true
  },
  {
    id: 20,
    customerName: 'Tanya Bansal',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Pearl Mala looks minimal, elegant, and timeless.',
    date: '2025-10-10',
    isVerified: true
  },

  {
    id: 21,
    customerName: 'Rashmi Chatterjee',
    customerAvatar: null,
    rating: 4,
    reviewText: 'Blue Sapphire Necklace Collection has a premium royal tone.',
    date: '2025-09-25',
    isVerified: true
  },
  {
    id: 22,
    customerName: 'Mitali Roy',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Coral Mala feels vibrant and full of character.',
    date: '2025-09-20',
    isVerified: true
  },
  {
    id: 23,
    customerName: 'Sakshi Jain',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Multi-Sapphire Necklace Collection is colorful and premium.',
    date: '2025-09-15',
    isVerified: true
  },
  {
    id: 24,
    customerName: 'Pallavi Deshmukh',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Emerald Mala gives a rich and graceful look.',
    date: '2025-09-10',
    isVerified: true
  },
  {
    id: 25,
    customerName: 'Ankita Verma',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Tanzanite Necklace Collection stands out beautifully.',
    date: '2025-09-05',
    isVerified: true
  },

  {
    id: 26,
    customerName: 'Rahul Mehra',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Bought a Ruby Mala as a gift. The recipient loved it.',
    date: '2025-08-28',
    isVerified: true
  },
  {
    id: 27,
    customerName: 'Kunal Sharma',
    customerAvatar: null,
    rating: 4,
    reviewText: 'Pearl Necklace Collection looks classy and refined.',
    date: '2025-08-22',
    isVerified: true
  },
  {
    id: 28,
    customerName: 'Ayesha Khan',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Morganite Mala looks soft, modern, and elegant.',
    date: '2025-08-18',
    isVerified: true
  },
  {
    id: 29,
    customerName: 'Lavanya Rao',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Blue Sapphire Mala gives a luxurious royal feel.',
    date: '2025-08-12',
    isVerified: true
  },
  {
    id: 30,
    customerName: 'Rina Mukherjee',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Coral Necklace Collection has bold and beautiful tones.',
    date: '2025-08-05',
    isVerified: true
  },

  {
    id: 31,
    customerName: 'Sneha Pillai',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Emerald Mala feels premium and natural.',
    date: '2025-07-28',
    isVerified: true
  },
  {
    id: 32,
    customerName: 'Harsh Gupta',
    customerAvatar: null,
    rating: 4,
    reviewText: 'Multi-Sapphire Necklace Collection looks vibrant and festive.',
    date: '2025-07-20',
    isVerified: true
  },
  {
    id: 33,
    customerName: 'Komal Arora',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Ruby Mala looks luxurious and traditional.',
    date: '2025-07-15',
    isVerified: true
  },
  {
    id: 34,
    customerName: 'Nandini Iyer',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Tanzanite Necklace Collection feels unique and premium.',
    date: '2025-07-10',
    isVerified: true
  },
  {
    id: 35,
    customerName: 'Rohini Patil',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Pearl Mala Collection is elegant and timeless.',
    date: '2025-07-05',
    isVerified: true
  },

  {
    id: 36,
    customerName: 'Divya Nair',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Blue Sapphire Necklace looks rich and luxurious.',
    date: '2025-06-25',
    isVerified: true
  },
  {
    id: 37,
    customerName: 'Manisha Kapoor',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Emerald Mala Collection feels premium and authentic.',
    date: '2025-06-18',
    isVerified: true
  },
  {
    id: 38,
    customerName: 'Ritika Malhotra',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Morganite Mala looks soft, elegant, and modern.',
    date: '2025-06-12',
    isVerified: true
  },
  {
    id: 39,
    customerName: 'Sameer Joshi',
    customerAvatar: null,
    rating: 4,
    reviewText: 'Ruby Necklace Collection looks bold and premium.',
    date: '2025-06-05',
    isVerified: true
  },
  {
    id: 40,
    customerName: 'Poonam Verma',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Coral Mala feels vibrant and lively.',
    date: '2025-06-01',
    isVerified: true
  },

  {
    id: 41,
    customerName: 'Aarushi Jain',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Tanzanite Mala looks stunning and rare.',
    date: '2025-05-20',
    isVerified: true
  },
  {
    id: 42,
    customerName: 'Kiran Malviya',
    customerAvatar: null,
    rating: 4,
    reviewText: 'Multi-Sapphire Necklace Collection has excellent color harmony.',
    date: '2025-05-15',
    isVerified: true
  },
  {
    id: 43,
    customerName: 'Nupur Saxena',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Pearl Mala Collection is minimal and graceful.',
    date: '2025-05-10',
    isVerified: true
  },
  {
    id: 44,
    customerName: 'Shalini Menon',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Blue Sapphire Mala looks elegant and regal.',
    date: '2025-05-05',
    isVerified: true
  },
  {
    id: 45,
    customerName: 'Varsha Kulkarni',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Emerald Necklace Collection feels luxurious and premium.',
    date: '2025-05-01',
    isVerified: true
  },

  {
    id: 46,
    customerName: 'Rakesh Malhotra',
    customerAvatar: null,
    rating: 4,
    reviewText: 'Bought a Pearl Necklace as a gift. Great quality.',
    date: '2024-12-20',
    isVerified: true
  },
  {
    id: 47,
    customerName: 'Ishita Roy',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Ruby Mala Collection looks bold and premium.',
    date: '2024-12-15',
    isVerified: true
  },
  {
    id: 48,
    customerName: 'Sanya Kapoor',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Tanzanite Necklace Collection is absolutely gorgeous.',
    date: '2024-12-10',
    isVerified: true
  },
  {
    id: 49,
    customerName: 'Madhuri Patil',
    customerAvatar: null,
    rating: 5,
    reviewText: 'Emerald Mala looks rich, natural, and premium.',
    date: '2024-12-05',
    isVerified: true
  },
  {
    id: 50,
    customerName: 'Alok Verma',
    customerAvatar: null,
    rating: 4,
    reviewText: 'Multi-Sapphire Mala Collection is vibrant and beautifully crafted.',
    date: '2024-12-01',
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