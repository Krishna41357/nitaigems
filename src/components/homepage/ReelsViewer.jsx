import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Share2 } from 'lucide-react';

const ReelsViewer = ({ reels, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Save current scroll position
    scrollPositionRef.current = window.scrollY;

    // Prevent body scroll and fix position
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollPositionRef.current}px`;

    // Add escape key handler
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);

    return () => {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, scrollPositionRef.current);
      
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('keydown', handleEscape);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [onClose]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentIndex, isMuted, isPlaying]);

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

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const goToNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      setIsPlaying(true);
    }
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
          if (currentIndex < reels.length - 1) {
            goToNext();
          }
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
    if (currentIndex < reels.length - 1) {
      goToNext();
    } else {
      setCurrentIndex(0);
      setProgress(0);
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipeUp = distance > 50;
    const isSwipeDown = distance < -50;
    
    if (isSwipeUp && currentIndex < reels.length - 1) {
      goToNext();
    } else if (isSwipeDown && currentIndex > 0) {
      goToPrev();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const reel = reels[currentIndex];
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.title,
          text: reel.description,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Share failed:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const currentReel = reels[currentIndex];

  if (!currentReel) return null;

  return (
    <div 
      className="reels-viewer"
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="reels-viewer-close"
        aria-label="Close reels viewer"
      >
        <X size={20} className="text-white" />
      </button>

      {/* Progress Bar */}
      <div className="reels-viewer-progress">
        {reels.map((_, index) => (
          <div key={index} className="reels-progress-bar">
            <div 
              className="reels-progress-fill"
              style={{ 
                width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows (Desktop) */}
      {!isMobile && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={goToPrev}
              className="reels-viewer-nav reels-viewer-nav-left"
              aria-label="Previous reel"
            >
              <ChevronLeft size={32} className="text-white" />
            </button>
          )}
          
          {currentIndex < reels.length - 1 && (
            <button
              onClick={goToNext}
              className="reels-viewer-nav reels-viewer-nav-right"
              aria-label="Next reel"
            >
              <ChevronRight size={32} className="text-white" />
            </button>
          )}
        </>
      )}

      {/* Video Container */}
      <div className="reels-viewer-video-container">
        <video
          ref={videoRef}
          src={currentReel.videoUrl}
          className="reels-viewer-video"
          loop={false}
          muted={isMuted}
          playsInline
          autoPlay
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onEnded={handleVideoEnded}
        />

        {/* Click to play/pause */}
        <div className="reels-viewer-overlay" onClick={togglePlay} />

        {/* Side Controls */}
        <div className="reels-viewer-controls">
          <button
            onClick={toggleMute}
            className="reels-viewer-control-btn"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>

          <button
            onClick={handleShare}
            className="reels-viewer-control-btn"
            aria-label="Share"
          >
            <Share2 size={24} />
          </button>
        </div>

        {/* Video Info */}
        <div className="reels-viewer-info">
          <h3 className="text-white font-semibold text-xl mb-1">
            {currentReel.title}
          </h3>
          {currentReel.description && (
            <p className="text-white/90 text-sm mb-4">
              {currentReel.description}
            </p>
          )}
          <button className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
            Shop Now
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Swipe indicator for mobile */}
        {isMobile && (
          <div className="reels-viewer-swipe-hint">
            <ChevronLeft className="rotate-90" size={20} />
            <span>Swipe up for next</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelsViewer;