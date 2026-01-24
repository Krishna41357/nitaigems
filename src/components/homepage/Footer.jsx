import React, { useState } from 'react';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Youtube, ChevronDown } from 'lucide-react';
import { useHomePageTheme } from '../../pages/HomePage';

const Footer = () => {
  const theme = useHomePageTheme();
  const year = new Date().getFullYear();
  const [openSections, setOpenSections] = useState({
    quick: false,
    service: false,
    contact: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const quick = [
    { name: 'Collections', url: '#' },
    { name: 'New Arrivals', url: '#' },
    { name: 'Bespoke', url: '#' },
    { name: 'Certificates', url: '#' },
    { name: 'Care Guide', url: '#' },
  ];

  const service = [
    { name: 'Track Order', url: '#' },
    { name: 'Shipping Info', url: '#' },
    { name: 'Size Guide', url: '#' },
    { name: 'Contact', url: '#' },
  ];

  const socials = [
    { icon: Instagram, label: 'Instagram', link: "https://www.instagram.com/nitai_gems_?igsh=MW1sYXU2NTBldmlieA==" },
    { icon: Facebook, label: 'Facebook', link: "https://www.facebook.com/share/1GiAN3k2ps/" },
    
  ];

  return (
    <footer className="footer-section" style={{ backgroundColor: theme.footerBg }}>
      <style>{styles}</style>
      
      {/* Background Elements */}
      <div className="footer-bg">
        <div className="bg-overlay" />
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />
        <div className="glow-orb orb-3" />
        <div className="pattern-grid" />
      </div>

      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="brand-logo-container">
              <img 
                src='/logo/nitaigems.png' 
                alt="Nitai Gems" 
                className="brand-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="brand-logo-fallback">
                <div className="logo-diamond">
                  <div className="diamond-shape" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links - Collapsible on Mobile */}
          <div className="footer-column">
            <button 
              className="column-title-button"
              onClick={() => toggleSection('quick')}
            >
              <span>Quick Links</span>
              <ChevronDown 
                className={`chevron-icon ${openSections.quick ? 'open' : ''}`}
              />
            </button>
            <div className={`collapsible-content ${openSections.quick ? 'open' : ''}`}>
              <ul className="footer-links">
                {quick.map((link) => (
                  <li key={link.name}>
                    <a href={link.url} className="footer-link">
                      <span className="link-dot" />
                      {link.name}
                      <span className="link-underline" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Service Links - Collapsible on Mobile */}
          <div className="footer-column">
            <button 
              className="column-title-button"
              onClick={() => toggleSection('service')}
            >
              <span>Customer Service</span>
              <ChevronDown 
                className={`chevron-icon ${openSections.service ? 'open' : ''}`}
              />
            </button>
            <div className={`collapsible-content ${openSections.service ? 'open' : ''}`}>
              <ul className="footer-links">
                {service.map((link) => (
                  <li key={link.name}>
                    <a href={link.url} className="footer-link">
                      <span className="link-dot" />
                      {link.name}
                      <span className="link-underline" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Section - Collapsible on Mobile */}
          <div className="footer-column">
            <button 
              className="column-title-button"
              onClick={() => toggleSection('contact')}
            >
              <span>Reach Us</span>
              <ChevronDown 
                className={`chevron-icon ${openSections.contact ? 'open' : ''}`}
              />
            </button>
            <div className={`collapsible-content ${openSections.contact ? 'open' : ''}`}>
              <div className="contact-info">
                <a href="tel:+916350288120" className="contact-item">
                  <Phone className="contact-icon" />
                  <span>+91 63502 88120</span>
                </a>
                <a href="mailto:nitaigems.jewelry@gmail.com" className="contact-item">
                  <Mail className="contact-icon" />
                  <span>nitaigems.jewelry@gmail.com</span>
                </a>
                <div className="contact-item address-item">
                  <MapPin className="contact-icon" />
                  <span>
                    Shop No. 12, Johri Bazaar,<br />
                    Near Hawa Mahal, Jaipur,<br />
                    Rajasthan - 302002, India
                  </span>
                </div>
              </div>

              {/* Social Media */}
              <div className="social-section">
                <p className="social-title">Follow Us</p>
                <div className="social-links">
                  {socials.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.link}
                        aria-label={social.label}
                        className="social-link" >
                        
                        <Icon className="social-icon" />
                        <span className="social-ring" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="bottom-divider" />
          <div className="bottom-content">
            <p className="copyright">
              © {year} Nitai Gems. All rights reserved. Crafted for eternity.
            </p>
            <div className="bottom-links">
              <a href="#" className="bottom-link">Privacy Policy</a>
              <span className="bottom-separator">•</span>
              <a href="#" className="bottom-link">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Lato:wght@300;400;500;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.footer-section {
  position: relative;
  color: #ffffff;
  overflow: visible;
  width: 100%;
}

/* Background Elements */
.footer-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(255, 255, 255, 0.04) 0%, transparent 50%);
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.08;
}

.orb-1 {
  top: -100px;
  left: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent);
}

.orb-2 {
  bottom: -150px;
  right: 10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.12), transparent);
}

.orb-3 {
  top: 50%;
  left: 50%;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent);
  animation: float 8s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -60%) scale(1.1); }
}

.pattern-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.5;
}

/* Container */
.footer-container {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem 1rem;
  overflow: visible;
}

/* Grid */
.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
    gap: 1.75rem;
    margin-bottom: 1.75rem;
  }
  
  .footer-container {
    padding: 2.5rem 2rem 1.25rem;
  }
}

/* Brand Section */
.footer-brand {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

@media (min-width: 768px) {
  .footer-brand {
    align-items: flex-start;
    text-align: left;
    max-width: 400px;
  }
}

.brand-logo-container {
  width: 100%;
  max-width: 160px;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
}

@media (min-width: 768px) {
  .brand-logo-container {
    max-width: 220px;
    justify-content: flex-start;
    margin-bottom: 0.75rem;
  }
}

@media (min-width: 1024px) {
  .brand-logo-container {
    max-width: 260px;
  }
}

.brand-logo {
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2));
}

.brand-logo-fallback {
  display: none;
  width: 80px;
  height: 80px;
  justify-content: center;
  align-items: center;
}

.logo-diamond {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.diamond-shape {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  transform: rotate(45deg);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
}

/* Footer Columns */
.footer-column {
  min-width: 0;
}

/* Collapsible Title Button */
.column-title-button {
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.65rem 0;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.4rem;
  width: 100%;
  background: transparent;
  border-top: none;
  border-left: none;
  border-right: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.1);
}

@media (min-width: 768px) {
  .column-title-button {
    cursor: default;
    pointer-events: none;
    font-size: 1.15rem;
    margin-bottom: 0.85rem;
    letter-spacing: 2px;
  }
}

.column-title-button:hover {
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.2);
}

.chevron-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
  color: #ffffff;
}

.chevron-icon.open {
  transform: rotate(180deg);
}

@media (min-width: 768px) {
  .chevron-icon {
    display: none;
  }
}

/* Collapsible Content */
.collapsible-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.collapsible-content.open {
  max-height: 400px;
}

@media (min-width: 768px) {
  .collapsible-content {
    max-height: none !important;
    overflow: visible;
  }
}

/* Links */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .footer-links {
    gap: 0.6rem;
  }
}

.footer-link {
  font-family: 'Lato', sans-serif;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #ffffff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.05);
}

@media (min-width: 768px) {
  .footer-link {
    font-size: 0.875rem;
  }
}

.link-dot {
  width: 4px;
  height: 4px;
  background: #ffffff;
  border-radius: 50%;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: #ffffff;
  transform: translateX(5px);
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.15);
}

.footer-link:hover .link-dot {
  opacity: 1;
  background: #ffffff;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
}

.link-underline {
  position: absolute;
  bottom: -2px;
  left: 14px;
  width: 0;
  height: 1px;
  background: #ffffff;
  transition: width 0.3s ease;
}

.footer-link:hover .link-underline {
  width: calc(100% - 14px);
}

/* Contact Info */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

@media (min-width: 768px) {
  .contact-info {
    gap: 0.6rem;
    margin-bottom: 1rem;
  }
}

.contact-item {
  font-family: 'Lato', sans-serif;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #ffffff;
  text-decoration: none;
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  transition: color 0.3s ease;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.05);
}

@media (min-width: 768px) {
  .contact-item {
    font-size: 0.875rem;
    line-height: 1.5;
  }
}

.contact-item:hover {
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.1);
}

.address-item {
  cursor: default;
}

.address-item:hover {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.05);
}

.contact-icon {
  width: 16px;
  height: 16px;
  color: #ffffff;
  flex-shrink: 0;
  margin-top: 2px;
}

@media (min-width: 768px) {
  .contact-icon {
    width: 17px;
    height: 17px;
  }
}

/* Social Media */
.social-section {
  margin-top: 0.85rem;
}

@media (min-width: 768px) {
  .social-section {
    margin-top: 1.15rem;
  }
}

.social-title {
  font-family: 'Lato', sans-serif;
  font-size: 0.85rem;
  color: #ffffff;
  margin: 0 0 0.6rem 0;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.1);
}

@media (min-width: 768px) {
  .social-title {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }
}

.social-links {
  display: flex;
  gap: 0.65rem;
}

@media (min-width: 768px) {
  .social-links {
    gap: 0.85rem;
  }
}

.social-link {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  text-decoration: none;
}

@media (min-width: 768px) {
  .social-link {
    width: 42px;
    height: 42px;
  }
}

.social-icon {
  width: 17px;
  height: 17px;
  color: #ffffff;
  transition: all 0.3s ease;
  z-index: 1;
}

@media (min-width: 768px) {
  .social-icon {
    width: 19px;
    height: 19px;
  }
}

.social-ring {
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #ffffff;
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
}

.social-link:hover .social-icon {
  color: #ffffff;
  transform: scale(1.1);
}

.social-link:hover .social-ring {
  opacity: 0.5;
  transform: scale(1);
}

/* Footer Bottom */
.footer-bottom {
  padding-top: 1rem;
  padding-bottom: 0;
}

@media (min-width: 768px) {
  .footer-bottom {
    padding-top: 1.25rem;
  }
}

.bottom-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .bottom-divider {
    margin-bottom: 1.25rem;
  }
}

.bottom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  text-align: center;
  padding-bottom: 1rem;
}

@media (min-width: 768px) {
  .bottom-content {
    flex-direction: row;
    justify-content: space-between;
    padding-bottom: 1.25rem;
  }
}

.copyright {
  font-family: 'Lato', sans-serif;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #e8e8e8;
  margin: 0;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.05);
}

.bottom-links {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.bottom-link {
  font-family: 'Lato', sans-serif;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #e8e8e8;
  text-decoration: none;
  transition: color 0.3s ease;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.05);
}

.bottom-link:hover {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.1);
}

.bottom-separator {
  color: #e8e8e8;
  font-size: 0.8125rem;
}

/* Responsive */
@media (max-width: 480px) {
  .footer-container {
    padding: 1.75rem 1rem 0.85rem;
  }
  
  .brand-logo-container {
    max-width: 145px;
  }
  
  .column-title-button {
    font-size: 0.95rem;
  }
  
  .footer-link,
  .contact-item {
    font-size: 0.775rem;
  }
  
  .social-link {
    width: 36px;
    height: 36px;
  }
  
  .social-icon {
    width: 16px;
    height: 16px;
  }
  
  .bottom-content {
    padding-bottom: 0.85rem;
  }
}
`;

export default Footer;