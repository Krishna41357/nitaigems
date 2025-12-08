import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './reels.css';
import './category-bg.css';

const ReelsSection = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const autoplayRef = useRef(true);
  const [stackMode, setStackMode] = useState('spread'); // 'spread' | 'stack'
  const stackRef = useRef(null);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/reels`);
      if (response.ok) {
        const data = await response.json();
        const activeReels = data.filter(reel => reel.isActive);
        
        if (activeReels.length > 0) {
          setReels(activeReels);
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

  const loadLocalReels = () => {
    const localReels = [
      {
        id: 'reel-local-1',
        videoUrl: 'https://res.cloudinary.com/dxoxbnptl/video/upload/v1765112697/video1_hieygd.mp4',
        title: 'Diamond Styling Tips',
        description: 'Exquisite Vines Diamond Necklace Set',
        duration: 45,
        isActive: true
      },
      {
        id: 'reel-local-2',
        videoUrl: 'https://res.cloudinary.com/dxoxbnptl/video/upload/v1765112696/video3_miynta.mp4',
        title: 'Elegant Diamond Jewellery',
        description: 'Every Day Diamond Collection',
        duration: 60,
        isActive: true,
      },
      {
        id: 'reel-local-3',
        videoUrl: 'https://res.cloudinary.com/dxoxbnptl/video/upload/v1765112694/video2_a54fyn.mp4',
        title: 'Precious Necklace Jewellery',
        description: 'Precious Stones Collection',
        duration: 60,
        isActive: true,
      },
    ];

    setReels(localReels);
  };

  // animate from a spread line into an overlapping stack for visual accuracy
  useEffect(() => {
    // short delay so layout is visible as a line first then collapses
    const t = setTimeout(() => setStackMode('stack'), 450);
    return () => clearTimeout(t);
  }, []);

  // 🔧 FIX: Move condition INSIDE the useEffect
  useEffect(() => {
    // Condition is now inside the hook, not wrapping it
    if (!stackRef.current) return;
    
    const vids = stackRef.current.querySelectorAll('video');
    vids.forEach(v => {
      try {
        if (v !== videoRef.current) {
          v.pause();
          v.currentTime = 0;
        }
      } catch (e) {}
    });
    
    // attempt to play the front video
    if (videoRef.current && autoplayRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
    }
  }, [reels, stackMode, isMuted]);

  const openModal = (index) => {
    // open modal for larger view (inline autoplay remains)
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsPlaying(false);
    setProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const goToNextReel = () => {
    // rotate array to bring next reel to front
    setReels(prev => {
      if (!prev || prev.length === 0) return prev;
      const [first, ...rest] = prev;
      return [...rest, first];
    });
    setProgress(0);
    // keep playing
    setIsPlaying(true);
  };

  const goToPreviousReel = () => {
    // rotate array backward to bring last reel to front
    setReels(prev => {
      if (!prev || prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, prev.length - 1);
      return [last, ...rest];
    });
    setProgress(0);
    setIsPlaying(true);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    const duration = videoRef.current?.duration || 10;

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current);
          goToNextReel();
          return 0;
        }
        return prev + (100 / (duration * 10));
      });
    }, 100);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const handleVideoEnded = () => {
    goToNextReel();
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-12 w-96 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-[600px] bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="relative h-[600px] max-w-md mx-auto">
            <div className="absolute inset-0 bg-gray-200 rounded-3xl animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (reels.length === 0) return null;

  const getStackPosition = (index) => {
    // when spread, place boxes in a wide line; when stacked, bring them closer
    // tuned values: make side reels smaller and push them further out
    const spreadXs = [-420, -270, 0, 270, 420];
    const stackXs = [-240, -120, 0, 120, 240];
    const spreadYs = [-70, -35, 0, 35, 70];
    // both sides sit slightly above the center (same upward direction), and remain behind via z-index
    const stackYs = [-20, -12, 0, -12, -20];
    // keep behind reels straight (no tilt)
    const rotates = [0, 0, 0, 0, 0];
    // slightly smaller overall sizes so outer reels feel more distant
    const scales = [0.78, 0.88, 0.98, 0.88, 0.78];
    const zIndices = [5, 25, 60, 25, 5];

    const x = stackMode === 'spread' ? (spreadXs[index] ?? 0) : (stackXs[index] ?? 0);
    const y = stackMode === 'spread' ? (spreadYs[index] ?? 0) : (stackYs[index] ?? 0);
    const rotate = rotates[index] ?? 0;
    const scale = scales[index] ?? 0.8;
    const zIndex = zIndices[index] ?? 0;
    return { rotate, scale, zIndex, x, y };
  };

  return (
    <>
      <section className="py-16 category-bg-section overflow-hidden relative">
        {/* Background layers (gradient, blurred shapes, particles) */}
        <div className="reels-bg" aria-hidden="true">
          <div className="reels-gradient" />
          <div className="floating-shape shape-1" />
          <div className="floating-shape shape-2" />
          <div className="floating-shape shape-3" />
          <div className="floating-shape shape-4" />
          {/* falling sparkles (Reels only) */}
          <div className="particle particle-1" />
          <div className="particle particle-2" />
          <div className="particle particle-3" />
          <div className="particle particle-4" />
          <div className="particle particle-5" />
          <div className="particle particle-6" />
          <div className="particle particle-7" />
          <div className="particle particle-8" />
          <div className="particle particle-9" />
          <div className="particle particle-10" />
          <div className="particle particle-11" />
          <div className="particle particle-12" />
          <div className="particle particle-13" />
          <div className="particle particle-14" />
          <div className="particle particle-15" />
          <div className="particle particle-16" />
          <div className="particle particle-17" />
          <div className="particle particle-18" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-3">
              Styling 101 With Diamonds
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Trendsetting diamond jewellery suited for every occasion
            </p>
          </div>

          {/* Stacked Reels with Navigation */}
          <div className="relative max-w-6xl mx-auto px-16 md:px-20">
            {/* Left Arrow */}
            {reels.length > 1 && (
              <button
                onClick={goToPreviousReel}
                className="absolute left-0 md:left-2 top-[45%] md:top-1/2 -translate-y-1/2 z-[70] w-12 h-12 md:w-16 md:h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-xl hover:scale-110 border-2 border-gray-200"
              >
                <ChevronLeft size={28} className="text-gray-900 bg-transparent stroke-[2.5]" />
              </button>
            )}

            {/* Right Arrow */}
            {reels.length > 1 && (
              <button
                onClick={goToNextReel}
                className="absolute right-0 md:right-2 top-[45%] md:top-1/2 -translate-y-1/2 z-[70] w-12 h-12 md:w-16 md:h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-xl hover:scale-110 border-2 border-gray-200"
              >
                <ChevronRight size={28} className="text-gray-900 stroke-[2.5]" />
              </button>
            )}

            <div ref={stackRef} className="relative h-[550px] max-w-md mx-auto perspective-1000">
              {Array.from({ length: 5 }).map((_, index) => {
                // Map slots so that the center slot (index 2) displays the active reel (reels[0]).
                // This keeps `reels[0]` as the front/active reel while allowing circular neighbors.
                const centerSlot = 2;
                const reel = reels.length > 0 ? reels[(index - centerSlot + reels.length) % reels.length] : undefined;
                const position = getStackPosition(index);
                return (
                  <div
                    key={`${reel?.id ?? 'placeholder'}-${index}`}
                    onClick={() => openModal(index)}
                    className="absolute inset-0 cursor-pointer transition-all duration-700 ease-out"
                    style={{
                      transform: `translateX(${position.x}px) translateY(${position.y ?? 0}px) scale(${position.scale}) rotate(${position.rotate}deg)`,
                      zIndex: position.zIndex,
                      transformOrigin: 'center center',
                    }}
                  >
                    <div style={{ width: '300px', height: '100%', margin: '0 auto' }} className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow">
                      {/* Video Thumbnail (first frame) */}
                      {reel ? (
                        <video
                          ref={index === 2 ? videoRef : undefined}
                          src={reel.videoUrl}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                          autoPlay={index === 2}
                          onPlay={index === 2 ? handleVideoPlay : undefined}
                          onPause={index === 2 ? handleVideoPause : undefined}
                          onEnded={index === 2 ? handleVideoEnded : undefined}
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <div className="w-3/4 h-3/4 bg-white/10 rounded-2xl border border-white/6" />
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

                      {/* Top Controls (only on front card) */}
                      {index === 2 && (
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-white text-sm font-medium">Live</span>
                          </div>
                          <button className="text-white hover:scale-110 transition-transform">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                          </button>
                        </div>
                      )}

                      {/* Center Play Button - Removed for auto-play */}
                      
                      {/* Bottom Info (only on front card) */}
                      {index === 2 && reel && (
                        <div className="absolute bottom-0 left-0 right-0 p-6">
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

              {/* Progress Indicators (always 5) */}
              <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 flex gap-2">
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
        </div>
      </section>

      {/* Video Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2">
            {reels.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width: index === 0 ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Prev arrow */}
          {reels.length > 1 && (
            <button
              onClick={goToPreviousReel}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-20 md:h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronLeft size={32} className="text-white md:w-12 md:h-12" />
            </button>
          )}
          
          {reels.length > 1 && (
            <button
              onClick={goToNextReel}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-20 md:h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight size={32} className="md:w-12 md:h-12" />
            </button>
          )}

          {/* Video Container */}
          <div className="relative w-full max-w-md h-full max-h-screen md:max-h-[90vh] flex items-center justify-center">
            <video
              src={reels[0]?.videoUrl}
              className="w-full h-full object-contain"
              loop={false}
              muted={isMuted}
              playsInline
              autoPlay
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onEnded={handleVideoEnded}
            />

            {/* Video Controls Overlay - Removed play button, just for pause */}
            <div className="absolute inset-0" onClick={togglePlay} />

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className="absolute bottom-24 right-4 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>

            {/* Video Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-white font-semibold text-xl mb-1">
                {reels[0]?.title}
              </h3>
              {reels[0]?.description && (
                <p className="text-white/90 text-sm mb-3">
                  {reels[0]?.description}
                </p>
              )}
              <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
                Shop Now
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
};

export default ReelsSection;