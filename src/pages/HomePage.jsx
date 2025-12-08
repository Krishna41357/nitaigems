import React, { useState } from 'react';
import MainHeader from '../components/homepage/MainHeader';
import Navigation from '../components/homepage/Navigation';
import HeroCarousel from '../components/homepage/HeroCarousel';
import CollectionsSection from '../components/homepage/CollectionsSection';
import CategoryCardsSection from '../components/homepage/CategoryCardsSection';
import ReelsSection from '../components/homepage/ReelsSection';
import TrustBadgesSection from '../components/homepage/TrustBadgesSection';
import ReviewsCarousel from '../components/homepage/ReviewsCarousel';
import Footer from '../components/homepage/Footer';
import RingModel from '../components/homepage/RingModel';
import JewelleryCategoriesSection from '../components/homepage/JewelleryCategoriesSection';
import SubcategoriesShowcase from '../components/homepage/SubcategoriesShowcase';

const HomePage = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <style>{`
        /* Additional HomePage specific fixes */
        .homepage-wrapper {
          max-width: 100vw;
          overflow-x: hidden;
          width: 100%;
        }
        
        /* Ensure all sections don't overflow */
        .homepage-wrapper > * {
          max-width: 100vw;
          overflow-x: hidden;
        }
        
        /* Mobile specific fixes */
        @media (max-width: 768px) {
          .homepage-wrapper {
            padding: 0;
            margin: 0;
          }
          
          .homepage-wrapper > section {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
        }
      `}</style>

      <div className="homepage-wrapper">
        {/* Main Header */}
        <MainHeader 
          logoUrl="/logo.png"
          onMenuClick={() => setShowMobileMenu(true)}
        />

        {/* Navigation with Mega Menu */}
        

        {/* Hero Carousel */}
        <HeroCarousel />

        <JewelleryCategoriesSection />
        
        {/* Ring Model / Hero with Emerald */}
      
      
        {/* Jewellery Categories Section */}
        
        
        {/* Category Cards Section */}
        <CategoryCardsSection />

        {/* Subcategories Showcase */}
        <SubcategoriesShowcase />

        {/* Collections Section */}
        {/* <CollectionsSection /> */}

        {/* Reels Section */}
        <ReelsSection />

        {/* Trust Badges / Assurance Section */}
        <TrustBadgesSection />

        {/* Customer Reviews Carousel */}
        <ReviewsCarousel />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;