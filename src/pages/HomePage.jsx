import React, { useState, useEffect, createContext, useContext } from 'react';
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
import Loading from "../components/Loading";

// Create Theme Context
const ThemeContext = createContext(null);

// Custom hook to use theme
export const useHomePageTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default theme if context not available
    return {
      heroBg: '#FFFFFF',
      categoriesBg: '#F9FAFB',
      subcategoriesBg: '#FFFFFF',
      collectionsBg: '#F9FAFB',
      reelsBg: '#FFFFFF',
      trustBadgesBg: '#F9FAFB',
      reviewsBg: '#FFFFFF',
      footerBg: '#1F2937',
    };
  }
  return context;
};

const HomePage = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/homepage-theme`);
      if (response.ok) {
        const data = await response.json();
        setTheme(data);
      } else {
        // Use default theme
        setTheme({
          heroBg: '#FFFFFF',
          categoriesBg: '#F9FAFB',
          subcategoriesBg: '#FFFFFF',
          collectionsBg: '#F9FAFB',
          reelsBg: '#FFFFFF',
          trustBadgesBg: '#F9FAFB',
          reviewsBg: '#FFFFFF',
          footerBg: '#1F2937',
        });
      }
    } catch (error) {
      console.error('Error fetching homepage theme:', error);
      // Use default theme
      setTheme({
        heroBg: '#FFFFFF',
        categoriesBg: '#F9FAFB',
        subcategoriesBg: '#FFFFFF',
        collectionsBg: '#F9FAFB',
        reelsBg: '#FFFFFF',
        trustBadgesBg: '#F9FAFB',
        reviewsBg: '#FFFFFF',
        footerBg: '#1F2937',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loading/>
    );
  }

  return (
    <ThemeContext.Provider value={theme}>
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

        

          {/* Hero Carousel */}
          <HeroCarousel />

          {/* Jewellery Categories Section */}
          <JewelleryCategoriesSection />
          
          {/* Category Cards Section */}
          <CategoryCardsSection />

          {/* Subcategories Showcase */}
          <SubcategoriesShowcase />

          {/* Collections Section */}
          {/* <CollectionsSection /> */}

          {/* Reels Section - Now navigates to /reels page */}
          <ReelsSection />

          {/* Trust Badges / Assurance Section */}
          <TrustBadgesSection />

          {/* Customer Reviews Carousel */}
          <ReviewsCarousel />

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default HomePage;