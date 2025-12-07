import React, { useState } from 'react';
import MainHeader from '../components/homepage/MainHeader';
import Navigation from '../components/homepage/Navigation';
import HeroCarousel from '../components/homepage/HeroCarousel';
import CollectionsSection from '../components/homepage/CollectionsSection';
import CategoryCardsSection from '../components/homepage/CategoryCardsSection';
import ReelsSection from '../components/homepage/ReelsSection';
import TrustBadgesSection from '../components/homepage/TrustBadgesSection';
import ExchangeProgramBanner from '../components/homepage/ExchangeProgramBanner';
import ReviewsCarousel from '../components/homepage/ReviewsCarousel';
import Footer from '../components/homepage/Footer';
import RingModel from '../components/homepage/RingModel';
import JewelleryCategoriesSection from '../components/homepage/JewelleryCategoriesSection';
import SubcategoriesShowcase from '../components/homepage/SubcategoriesShowcase';


const HomePage = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <MainHeader 
        logoUrl="/logo.png"
        onMenuClick={() => setShowMobileMenu(true)}
      />

      {/* Navigation with Mega Menu */}
      <Navigation 
        showMobileSidebar={showMobileMenu}
        onCloseSidebar={() => setShowMobileMenu(false)}
      />

      <HeroCarousel />
       <RingModel />
     
      {/* Hero Carousel */}
      <JewelleryCategoriesSection/>
      

        <CategoryCardsSection />

        <SubcategoriesShowcase />
       

      {/* Collections Section */}
      <CollectionsSection />

      {/* Category Cards Section */}
    



      {/* Reels Section */}
      <ReelsSection />

      {/* Trust Badges / Assurance Section */}
      <TrustBadgesSection />

     
      

      {/* Customer Reviews Carousel */}
      <ReviewsCarousel />

      {/* Why Choose Us */}
     

      {/* Newsletter */}

      {/* Footer - Using new Footer component */}
      <Footer />
    </div>
  );
};

export default HomePage;