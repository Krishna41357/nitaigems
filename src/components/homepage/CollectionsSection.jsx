import React, { useState, useEffect } from 'react';

const CollectionsSection = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndices, setCurrentIndices] = useState({});
  const [slideDirections, setSlideDirections] = useState({});
  const [isTransitioning, setIsTransitioning] = useState([false, false, false]);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/collections`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCollections(data);

      const idx = {};
      if (data.length >= 3) {
        idx[0] = 0;
        idx[1] = 1;
        idx[2] = 2;
      } else {
        [0, 1, 2].forEach(p => (idx[p] = p % data.length));
      }
      setCurrentIndices(idx);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!collections.length) return;

    const directions = ['left', 'right', 'top', 'bottom'];
    const timings = [0, 2200, 4400];
    const timers = [];

    timings.forEach((delay, pos) => {
      timers.push(
        setTimeout(() => {
          triggerSlide(pos, directions);
        }, delay)
      );
    });

    const interval = setInterval(() => {
      timings.forEach((delay, pos) => {
        timers.push(
          setTimeout(() => {
            triggerSlide(pos, directions);
          }, delay)
        );
      });
    }, 12000 + timings[2]);

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [collections.length]);

  const triggerSlide = (pos, directions) => {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    setSlideDirections(prev => ({ ...prev, [pos]: dir }));

    setIsTransitioning(prev => {
      const next = [...prev];
      next[pos] = true;
      return next;
    });

    setTimeout(() => {
      setCurrentIndices(prev => {
        const copy = { ...prev };
        let nextIdx;
        let tries = 0;
        do {
          nextIdx = Math.floor(Math.random() * collections.length);
          tries++;
        } while (copy[pos] === nextIdx && tries < 30 && collections.length > 1);
        copy[pos] = nextIdx;
        return copy;
      });

      setTimeout(() => {
        setIsTransitioning(prev => {
          const next = [...prev];
          next[pos] = false;
          return next;
        });
      }, 50);
    }, 800);
  };

  const handleClick = slug => {
    window.location.href = `/products/collection/${slug}`;
  };
  
  const getCol = pos => collections[currentIndices[pos] % collections.length];

  if (loading) return <Skeleton />;
  if (error) return <Error onRetry={fetchCollections} />;
  if (!collections.length) return null;

  return (
    <>
      <style>{styles}</style>
      <section className="collections-section">
        <div className="container">
          {/* Enhanced Header */}
          <div className="header-wrapper">
            <h2 className="header-title">Signature Collections</h2>
            <div className="header-divider">
              <span className="divider-icon">✦</span>
              <div className="divider-line"></div>
              <span className="divider-icon-small">◆</span>
              <div className="divider-line"></div>
              <span className="divider-icon">✦</span>
            </div>
            <p className="sub-title">Explore our newly launched collection</p>
          </div>

          <div className="cards-grid">
            <Card
              pos={0}
              size="large"
              transitioning={isTransitioning[0]}
              direction={slideDirections[0]}
              collection={getCol(0)}
              onClick={handleClick}
            />

            <div className="small-cards-wrapper">
              <Card
                pos={1}
                size="small"
                transitioning={isTransitioning[1]}
                direction={slideDirections[1]}
                collection={getCol(1)}
                onClick={handleClick}
              />
              <Card
                pos={2}
                size="small"
                transitioning={isTransitioning[2]}
                direction={slideDirections[2]}
                collection={getCol(2)}
                onClick={handleClick}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const Card = ({ pos, size, transitioning, direction, collection, onClick }) => (
  <div className={`collection-card-wrapper ${size}-card`} onClick={() => onClick(collection.slug)}>
    <div className="glow-border" />
    <div className="shine-effect" />
    <Particles count={size === 'large' ? 6 : 4} />
    <div className="slide-container">
      <div
        className={`slide-content ${transitioning ? `exit-${direction || 'left'}` : ''}`}
        key={`exit-${pos}-${collection.slug}`}
      >
        <img src={collection.imageUrl} alt={collection.name} className="collection-image" />
        <div className="collection-overlay">
          <h3 className={`collection-title ${size === 'small' ? 'small' : ''}`}>{collection.name}</h3>
        </div>
      </div>

      {transitioning && (
        <div
          className={`slide-content enter-${direction || 'right'}`}
          key={`enter-${pos}-${collection.slug}`}
        >
          <img src={collection.imageUrl} alt={collection.name} className="collection-image" />
          <div className="collection-overlay">
            <h3 className={`collection-title ${size === 'small' ? 'small' : ''}`}>{collection.name}</h3>
          </div>
        </div>
      )}
    </div>
  </div>
);

const Particles = ({ count }) => (
  <div className="particles">
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="particle"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 2}s`
        }}
      />
    ))}
  </div>
);

const Skeleton = () => (
  <section className="skeleton-section">
    <div className="container">
      <div className="header-wrapper">
        <div className="skeleton-title" />
        <div className="skeleton-subtitle" />
      </div>
      <div className="cards-grid">
        <div className="skeleton-card large" />
        <div className="small-cards-wrapper">
          <div className="skeleton-card small" />
          <div className="skeleton-card small" />
        </div>
      </div>
    </div>
  </section>
);

const Error = ({ onRetry }) => (
  <section className="error-section">
    <div className="container">
      <p className="error-text">Failed to load collections</p>
      <button onClick={onRetry} className="retry-button">
        Try Again
      </button>
    </div>
  </section>
);

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.collections-section {
  background: url('/bg4.jpg') center/cover no-repeat;
  background-color: #2a1a0d;
  position: relative;
  padding: clamp(2rem, 5vw, 4rem) 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
}

.collections-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 3vw, 2rem);
  position: relative;
  z-index: 1;
}

.header-wrapper {
  text-align: center;
  margin-bottom: clamp(2rem, 5vw, 4rem);
}

.header-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  font-weight: 700;
  line-height: 1.1;
  background: linear-gradient(
    135deg,
    #fdf3d0 0%,
    #FFD700 25%,
    #c89a3c 50%,
    #FFD700 75%,
    #fdf3d0 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s ease-in-out infinite;
  background-size: 200% auto;
  letter-spacing: clamp(1px, 0.2vw, 2px);
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)) 
          drop-shadow(0 4px 8px rgba(0, 0, 0, 0.9));
  -webkit-text-stroke: 1px rgba(139, 69, 19, 0.6);
  margin-bottom: clamp(1rem, 2vw, 1.5rem);
}

@keyframes shimmer {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}

.header-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.5rem, 1.5vw, 1rem);
  margin: clamp(1rem, 2vw, 1.5rem) 0;
}

.divider-icon {
  color: #FFD700;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}

.divider-icon-small {
  color: #FFD700;
  font-size: clamp(0.75rem, 1vw, 0.875rem);
}

.divider-line {
  height: 1px;
  width: clamp(2rem, 5vw, 3rem);
  background: rgba(255, 215, 0, 0.6);
}

.sub-title {
  font-family: 'Arial', sans-serif;
  font-size: clamp(1rem, 2.5vw, 1.75rem);
  font-weight: 600;
  color: #ffffff;
  -webkit-text-stroke: 1.5px #2a1a0d;
  letter-spacing: clamp(0.5px, 0.15vw, 1.5px);
  text-shadow:
    0 0 15px rgba(0, 0, 0, 0.9),
    0 0 25px rgba(30, 29, 29, 0.7),
    0 2px 6px rgba(155, 153, 153, 0.8);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.95));
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1rem, 2vw, 1.5rem);
  max-width: 100%;
}

@media (min-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.small-cards-wrapper {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: clamp(1rem, 2vw, 1.5rem);
}

.collection-card-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: clamp(1rem, 2vw, 1.5rem);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 15px 40px rgba(139, 69, 19, 0.25), 0 5px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
  width: 100%;
  height: 100%;
}

.collection-card-wrapper:hover {
  transform: translateY(-10px) scale(1.02);
}

.large-card {
  min-height: clamp(300px, 50vw, 600px);
  height: 100%;
}

.small-card {
  min-height: clamp(200px, 25vw, 285px);
  height: 100%;
}

@media (min-width: 768px) {
  .large-card {
    min-height: clamp(400px, 40vw, 600px);
  }
  
  .small-card {
    min-height: clamp(190px, 19vw, 285px);
  }
}

.slide-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.slide-content {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

.exit-left { animation: slideOutLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
.exit-right { animation: slideOutRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
.exit-top { animation: slideOutTop 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
.exit-bottom { animation: slideOutBottom 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

.enter-left { animation: slideInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
.enter-right { animation: slideInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
.enter-top { animation: slideInBottom 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
.enter-bottom { animation: slideInTop 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

@keyframes slideOutLeft { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(-110%); opacity: 0; } }
@keyframes slideOutRight { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(110%); opacity: 0; } }
@keyframes slideOutTop { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-110%); opacity: 0; } }
@keyframes slideOutBottom { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(110%); opacity: 0; } }

@keyframes slideInLeft { 0% { transform: translateX(-110%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
@keyframes slideInRight { 0% { transform: translateX(110%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
@keyframes slideInTop { 0% { transform: translateY(-110%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
@keyframes slideInBottom { 0% { transform: translateY(110%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }

.collection-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1), filter 0.4s ease;
}

.collection-card-wrapper:hover .collection-image {
  transform: scale(1.15) rotate(2deg);
  filter: brightness(1.05) contrast(1.1);
}

.collection-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.5) 40%, rgba(0, 0, 0, 0.2) 70%, transparent 100%);
  padding: clamp(1rem, 3vw, 2.5rem) clamp(1rem, 2vw, 2rem);
  transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.collection-card-wrapper:hover .collection-overlay {
  background: linear-gradient(to top, rgba(139, 69, 19, 0.95) 0%, rgba(139, 69, 19, 0.7) 40%, rgba(139, 69, 19, 0.3) 70%, transparent 100%);
  padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 2vw, 2rem);
}

.collection-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.5rem, 3.5vw, 2.5rem);
  font-weight: 700;
  color: #fff;
  text-align: center;
  letter-spacing: clamp(0.5px, 0.1vw, 1px);
  text-shadow: 3px 3px 12px rgba(0, 0, 0, 0.7);
  font-style: italic;
  position: relative;
  display: inline-block;
  transition: transform 0.3s ease;
}

.collection-title.small {
  font-size: clamp(1.25rem, 2.8vw, 1.9rem);
}

.collection-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 80%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #FFD700, transparent);
  transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.collection-card-wrapper:hover .collection-title::after {
  transform: translateX(-50%) scaleX(1);
}

.collection-card-wrapper:hover .collection-title {
  transform: translateY(-8px) scale(1.05);
}

.shine-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
  z-index: 10;
  pointer-events: none;
}

.collection-card-wrapper:hover .shine-effect {
  left: 100%;
}

.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.collection-card-wrapper:hover .particles {
  opacity: 1;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.9), transparent);
  border-radius: 50%;
  animation: float-particle 3s ease-in-out infinite;
}

@keyframes float-particle {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
}

.glow-border {
  position: absolute;
  inset: -3px;
  border-radius: clamp(1rem, 2vw, 1.5rem);
  background: linear-gradient(45deg, #FFD700, #B8860B, #FFD700);
  opacity: 0;
  filter: blur(12px);
  z-index: -1;
  transition: opacity 0.4s ease;
}

.collection-card-wrapper:hover .glow-border {
  opacity: 0.7;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.9; }
}

/* Skeleton Styles */
.skeleton-section {
  background: linear-gradient(to bottom, #2a1a0d, #1a0f06);
  padding: clamp(2rem, 5vw, 4rem) 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.skeleton-title {
  height: clamp(2.5rem, 7vw, 5.5rem);
  width: clamp(200px, 60vw, 400px);
  background: rgba(255, 215, 0, 0.2);
  border-radius: 0.5rem;
  margin: 0 auto clamp(1rem, 2vw, 1.5rem);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-subtitle {
  height: clamp(1rem, 2.5vw, 1.75rem);
  width: clamp(150px, 40vw, 250px);
  background: rgba(255, 215, 0, 0.1);
  border-radius: 0.5rem;
  margin: 0 auto;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-card {
  background: rgba(255, 215, 0, 0.1);
  border-radius: clamp(1rem, 2vw, 1.5rem);
  animation: pulse 1.5s ease-in-out infinite;
  width: 100%;
}

.skeleton-card.large {
  min-height: clamp(300px, 50vw, 600px);
}

.skeleton-card.small {
  min-height: clamp(200px, 25vw, 285px);
}

@media (min-width: 768px) {
  .skeleton-card.large {
    min-height: clamp(400px, 40vw, 600px);
  }
  
  .skeleton-card.small {
    min-height: clamp(190px, 19vw, 285px);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Error Styles */
.error-section {
  background: #2a1a0d;
  padding: clamp(2rem, 5vw, 4rem) 0;
  text-align: center;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.error-text {
  color: #ef4444;
  margin-bottom: 1rem;
  font-size: clamp(1rem, 2vw, 1.25rem);
}

.retry-button {
  color: #FFD700;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  font-size: clamp(1rem, 2vw, 1.125rem);
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

.retry-button:hover {
  text-decoration: underline;
  transform: scale(1.05);
}

/* Mobile Optimization */
@media (max-width: 767px) {
  .collections-section {
    padding: 2rem 0;
  }
  
  .collection-card-wrapper:hover {
    transform: translateY(-5px) scale(1.01);
  }
  
  .collection-card-wrapper:hover .collection-image {
    transform: scale(1.08);
  }
}

/* Small devices */
@media (max-width: 480px) {
  .header-wrapper {
    margin-bottom: 1.5rem;
  }
  
  .cards-grid {
    gap: 1rem;
  }
  
  .small-cards-wrapper {
    gap: 1rem;
  }
}
`;

export default CollectionsSection;