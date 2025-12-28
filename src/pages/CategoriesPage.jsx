// src/pages/CategoriesPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainHeader from '../components/homepage/MainHeader.jsx';
import Loading from "../components/Loading";

const API_BASE = import.meta.env.VITE_APP_BASE_URL;

const ArrowRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories/with-subcategories`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
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
    <div className="min-h-screen bg-white">
      <MainHeader/>
      {/* Page Title */}
      

      {/* Categories */}
      <div className="py-6 md:py-12">
        <div className="space-y-12 md:space-y-20">
          {categories.map((category) => {
            const hasSubcategories = category.subcategories && category.subcategories.length > 0;

            return (
              <div key={category.id}>
                {/* CASE 1: Subcategories OFF - Show Banner + Description */}
                {!hasSubcategories && (
                  <>
                    {/* Full Width Category Banner */}
                    <div 
                      className="relative h-64 md:h-80 lg:h-96 overflow-hidden cursor-pointer group"
                      onClick={() => navigate(`/products/category/${category.slug}`)}
                    >
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-[#10254b]/5 to-[#10254b]/10" />
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                      
                      {/* Category Name */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-12">
                        <div className="max-w-7xl mx-auto text-center">
                          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white tracking-wide font-serif mb-3">
                            {category.name}
                          </h2>
                          
                          {/* Thin White Line */}
                          <div className="w-16 md:w-20 h-px bg-white/70 mx-auto mb-3"></div>
                          
                          {/* Small Shop Now */}
                          <div className="flex items-center justify-center gap-2 text-white text-xs md:text-sm font-medium">
                            <span>Shop Now</span>
                            <ArrowRight />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description Below Banner */}
                    
                  </>
                )}

                {/* CASE 2: Subcategories ON - Show Only Name + Subcategory Cards */}
                {hasSubcategories && (
                  <>
                    {/* Category Name Only */}
                    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-4 md:pb-8">
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#10254b] tracking-wide font-serif text-center">
                        {category.name}
                      </h2>
                    </div>

                    {/* Subcategories Grid - Full Image Cards */}
                    <div className="max-w-7xl mx-auto px-4 md:px-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                        {category.subcategories.map((subcategory) => (
                          <div 
                            key={subcategory.id}
                            className="group cursor-pointer relative overflow-hidden bg-white border border-gray-200 hover:border-[#10254b] transition-all duration-300 hover:shadow-xl rounded-lg"
                            style={{ aspectRatio: '3/4' }}
                            onClick={() => navigate(`/products/category/${category.slug}/${subcategory.slug}`)}
                          >
                            {/* Full Image Background */}
                            {subcategory.image ? (
                              <img 
                                src={subcategory.image} 
                                alt={subcategory.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50" />
                            )}
                            
                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            
                            {/* Content Overlay - Centered */}
                            <div className="absolute inset-0 flex flex-col items-center justify-end p-3 md:p-4 lg:p-6">
                              <h3 className="font-semibold text-white text-sm md:text-base lg:text-lg mb-2 md:mb-3 tracking-wide text-center">
                                {subcategory.name}
                              </h3>
                              
                              {/* Thin White Divider Line */}
                              <div className="w-8 md:w-10 lg:w-12 h-px bg-white/60 mb-2 md:mb-3"></div>
                              
                              {/* Shop Now on Image - Centered */}
                              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium text-white group-hover:gap-2 md:group-hover:gap-3 transition-all">
                                <span>Shop Now</span>
                                <ArrowRight />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Divider between categories */}
                {categories.indexOf(category) < categories.length - 1 && (
                  <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
                    <div className="border-t border-gray-200" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No categories available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}