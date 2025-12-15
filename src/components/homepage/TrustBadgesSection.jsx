import React, { useEffect, useRef, useState } from 'react';
import { useHomePageTheme } from '../../pages/HomePage';

const TrustBadgesSection = () => {
  const theme = useHomePageTheme();
  const badges = [
    { 
      image: './logo/logo.png',
      title: 'Nitai Gems\nTrust',
      description: 'Your trusted jeweller since generations',
      type: 'logo'
    },
    { 
      image: 'https://indiadesignsystem.bombaydc.com/design/BIS-Hallmark',
      title: 'BIS Hallmark\nCertified',
      description: 'Guaranteed purity & authenticity',
      type: 'bis'
    },
    { 
      image: 'https://cdn-icons-png.flaticon.com/512/7794/7794400.png',
      title: 'Complete\nTransparency',
      description: 'Clear pricing, honest dealings',
      type: 'diamond'
    },
    { 
      image: 'https://cdn-icons-png.flaticon.com/512/9426/9426997.png',
      title: 'Lifetime\nMaintenance',
      description: 'Forever care & support',
      type: 'shield'
    }
  ];
  

  const gridRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = gridRef.current;
    if (!node) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      });
    }, { threshold: 0.2 });
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="trust-section" style={{ backgroundColor: theme.trustBadgesBg }}>
      <style>{styles}</style>
      
      {/* Decorative Background Elements */}
      <div className="trust-bg" aria-hidden="true">
        <div className="trust-gradient" />
        <div className="floating-particle p-1" />
        <div className="floating-particle p-2" />
        <div className="floating-particle p-3" />
        <div className="floating-particle p-4" />
        <div className="floating-particle p-5" />
        <div className="floating-particle p-6" />
      </div>

      <div className="trust-container">
        {/* Header Section */}
        <div className="trust-header">
          <div className="ornament-left">✦</div>
          <div className="ornament-right">✦</div>
          <p className="trust-quote">
            Trust us to be part of your precious moments and to deliver jewellery that you'll cherish forever.
          </p>
        </div>

        {/* Badges Grid */}
        <div ref={gridRef} className={`trust-grid ${inView ? 'in-view' : ''}`}>
          {badges.map(({ image, title, description, type }, idx) => (
            <div
              key={idx}
              className="trust-card"
              style={{ '--delay': `${idx * 0.15}s` }}
            >
              <div className="card-shine" />
              <div className="icon-container">
                <div className="icon-glow" />
                <img 
                  src={image} 
                  alt={title} 
                  className={`badge-image ${type === 'logo' ? 'logo-image' : ''}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <svg 
                  className="badge-icon fallback-icon" 
                  viewBox="0 0 120 120" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ display: 'none' }}
                >
                  {type === 'logo' && (
                    <>
                      <circle cx="60" cy="60" r="35" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.3"/>
                      <path d="M45 50 L60 35 L75 50 L60 80 Z" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                      <circle cx="60" cy="55" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </>
                  )}
                  {type === 'bis' && (
                    <>
                      <polygon points="60,25 75,45 90,50 75,75 60,95 45,75 30,50 45,45" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.3"/>
                      <circle cx="60" cy="60" r="20" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                      <path d="M60 45 L60 60 L70 70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                      <circle cx="60" cy="60" r="3" fill="currentColor"/>
                    </>
                  )}
                  {type === 'diamond' && (
                    <>
                      <path d="M40 45 L60 25 L80 45 L60 95 Z" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.2"/>
                      <path d="M40 45 L80 45" stroke="currentColor" strokeWidth="2.5"/>
                      <path d="M50 45 L60 95" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
                      <path d="M70 45 L60 95" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
                      <circle cx="60" cy="35" r="2" fill="currentColor"/>
                    </>
                  )}
                  {type === 'shield' && (
                    <>
                      <path d="M60 20 C60 20 80 25 80 45 C80 70 60 95 60 95 C60 95 40 70 40 45 C40 25 60 20 60 20 Z" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.2"/>
                      <path d="M50 55 L57 62 L72 47" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="60" cy="30" r="3" fill="currentColor"/>
                    </>
                  )}
                </svg>
              </div>
              <h3 className="badge-title">{title}</h3>
              <p className="badge-description">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@300;400;500&display=swap');

.trust-section {
  position: relative;
  min-height: 70vh;
  padding: 5rem 2rem 8rem;
  overflow: hidden;
}

/* Background Elements */
.trust-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.trust-gradient {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at top left, rgba(218, 165, 32, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(212, 175, 55, 0.06) 0%, transparent 50%);
}

.trust-gradient::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 150px;
  background: linear-gradient(to bottom, transparent 0%, rgba(139, 69, 19, 0.05) 100%);
}

.floating-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, rgba(218, 165, 32, 0.4), transparent);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.p-1 { top: 10%; left: 15%; animation-delay: 0s; }
.p-2 { top: 30%; right: 20%; animation-delay: 1s; }
.p-3 { bottom: 20%; left: 25%; animation-delay: 2s; }
.p-4 { top: 60%; right: 15%; animation-delay: 1.5s; }
.p-5 { bottom: 40%; left: 10%; animation-delay: 0.5s; }
.p-6 { top: 80%; right: 30%; animation-delay: 2.5s; }

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
  25% { transform: translate(10px, -20px) scale(1.2); opacity: 0.6; }
  50% { transform: translate(-5px, -40px) scale(0.9); opacity: 0.8; }
  75% { transform: translate(15px, -25px) scale(1.1); opacity: 0.5; }
}

/* Container */
.trust-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* Header */
.trust-header {
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  padding: 0 2rem;
}

.ornament-left,
.ornament-right {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  color: #d4a017;
  opacity: 0.4;
}

.ornament-left { left: 0; }
.ornament-right { right: 0; }

.trust-quote {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 500;
  font-style: italic;
  color: #4a3a2a;
  line-height: 1.8;
  max-width: 900px;
  margin: 0 auto;
  letter-spacing: 0.3px;
}

/* Grid */
.trust-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 3rem;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .trust-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 2.5rem;
  }
}

/* Cards */
.trust-card {
  position: relative;
  text-align: center;
  padding: 2.5rem 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  box-shadow: 
    0 8px 32px rgba(139, 69, 19, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.trust-grid.in-view .trust-card {
  animation: cardReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--delay, 0s);
}

@keyframes cardReveal {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.trust-card:hover {
  transform: translateY(-12px) scale(1.03);
  box-shadow: 
    0 20px 50px rgba(139, 69, 19, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  border-color: rgba(212, 175, 55, 0.35);
}

.card-shine {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.trust-card:hover .card-shine {
  opacity: 1;
}

/* Icon Container */
.icon-container {
  position: relative;
  width: 90px;
  height: 90px;
  margin: 0 auto 1.25rem;
}

.icon-glow {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(218, 165, 32, 0.3), rgba(212, 175, 55, 0.05));
  filter: blur(16px);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.trust-card:hover .icon-glow {
  opacity: 1;
}

.badge-icon {
  width: 100%;
  height: 100%;
  color: #b8860b;
  filter: drop-shadow(0 4px 12px rgba(184, 134, 11, 0.2));
  transition: all 0.4s ease;
}

.badge-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: all 0.4s ease;
  filter: drop-shadow(0 4px 12px rgba(184, 134, 11, 0.15));
}

.logo-image {
  object-fit: contain;
  padding: 8px;
}

.trust-card:hover .badge-icon,
.trust-card:hover .badge-image {
  transform: scale(1.1) rotate(5deg);
}

.trust-card:hover .logo-image {
  transform: scale(1.15);
  filter: drop-shadow(0 6px 16px rgba(184, 134, 11, 0.3));
}

/* Text */
.badge-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d1f0f;
  margin: 0 0 0.6rem 0;
  white-space: pre-line;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

.badge-description {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  font-weight: 400;
  color: #5b4a37;
  letter-spacing: 0.3px;
  margin: 0;
  line-height: 1.4;
}

/* Responsive - Mobile 2 Column Layout */
@media (max-width: 767px) {
  .trust-section {
    padding: 3rem 1rem 5rem;
  }
  
  .trust-header {
    margin-bottom: 2.5rem;
    padding: 0 1rem;
  }
  
  .trust-quote {
    font-size: 1.1rem;
    line-height: 1.6;
  }
  
  .trust-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    padding: 0 0.5rem;
  }
  
  .trust-card {
    padding: 1.75rem 1rem 1.5rem;
    border-radius: 16px;
  }
  
  .icon-container {
    width: 70px;
    height: 70px;
    margin: 0 auto 1rem;
  }
  
  .badge-title {
    font-size: 1rem;
    margin: 0 0 0.5rem 0;
  }
  
  .badge-description {
    font-size: 0.7rem;
  }
  
  .ornament-left,
  .ornament-right {
    display: none;
  }
}

/* Tablets */
@media (min-width: 768px) and (max-width: 1023px) {
  .trust-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
  
  .icon-container {
    width: 100px;
    height: 100px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .trust-card,
  .floating-particle,
  .badge-icon {
    animation: none;
    transition: none;
  }
  
  .trust-card {
    opacity: 1;
    transform: none;
  }
}
`;

export default TrustBadgesSection;