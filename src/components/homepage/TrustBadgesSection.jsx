import React, { useEffect, useRef, useState } from 'react';
import { useHomePageTheme } from '../../pages/HomePage';

const TrustBadgesSection = () => {
  const theme = useHomePageTheme();
  const badges = [
  { 
    image: '/logo/nitaigems.png',
    title: 'Nitai Gems\nTrust',
    description: 'A legacy of trust, craftsmanship, and excellence',
    type: 'logo'
  },
  { 
    image: '/certificate.svg',
    title: 'BIS Hallmark\nCertified',
    description: 'Official BIS hallmark ensuring gold purity and authenticity',
    type: 'bis'
  },
  { 
    image: '/shipping.svg',
    title: 'Secure\nShipping',
    description: 'Safe, insured, and timely delivery across India',
    type: 'diamond'
  },
  { 
    image: '/cod.svg',
    title: 'Cash on\nDelivery',
    description: 'Pay conveniently at your doorstep with COD option',
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
  {badges.map(({ image, title, description, type }, idx) => {
    const svgMap = {
      bis: '/certificate.svg',
      diamond: '/shipping.svg',
      shield: '/cod.svg',
    };

    return (
      <div
        key={idx}
        className="trust-card"
        style={{ '--delay': `${idx * 0.15}s` }}
      >
        <div className="card-shine" />

        <div className="icon-container">
          <div className="" />

          {/* LOGO → keep as image */}
          {type === 'logo' ? (
            <img
              src={image}
              alt={title}
              className="badge-image logo-image"
            />
          ) : (
            /* OTHER 3 → SVGs from public folder */
            <img
              src={svgMap[type]}
              alt={title}
              className="badge-image"
            />
          )}
        </div>

        <h3 className="badge-title">{title}</h3>
        <p className="badge-description">{description}</p>
      </div>
    );
  })}
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
  
}

.trust-gradient::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 150px;
  
}

.floating-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, #10254b , transparent);
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
  color: #10254b;
  opacity: 0.4;
}

.ornament-left { left: 0; }
.ornament-right { right: 0; }

.trust-quote {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 500;
  font-style: italic;
  color: #10254b;
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
  border: 1px solid black;
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
    0 20px 50px rgba(21, 19, 139, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 1);
;
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




.badge-icon {
  width: 100%;
  height: 100%;
  color: #10254b;
  transition: all 0.4s ease;
  
}

.badge-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: all 0.4s ease;
  filter: drop-shadow(0 4px 12px rgba(40, 11, 184, 0.15));
  scale:1.2;
}

.logo-image {
  object-fit: contain;

}

.trust-card:hover .badge-icon,
.trust-card:hover .badge-image {
  transform: scale(1.1) rotate(5deg);
}

.trust-card:hover .logo-image {
  transform: scale(1.15);
  filter: drop-shadow(0 6px 16px rgba(23, 11, 184, 0.3));
}

/* Text */
.badge-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #10254b;
  margin: 0 0 0.6rem 0;
  white-space: pre-line;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

.badge-description {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  font-weight: 400;
  color: #1a3974ff;
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