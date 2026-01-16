import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, X, SearchX } from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import MainHeader from "../components/homepage/MainHeader";
import Loading from "../components/Loading";

const ProductsListingPage = () => {
  const { categorySlug, subCategorySlug, collectionSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const [activeFilters, setActiveFilters] = useState({
    priceRanges: [],
    metals: [],
    metalPurities: [],
    stones: [],
    stoneTypes: [],
    clarities: [],
    sizes: [],
    colors: [],
    certifications: [],
    discounts: [],
    availability: [],
    tags: [],
    subcategories: []
  });

  // Subcategory carousel state
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const carouselRef = useRef(null);

  const showProducts = true;

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Initialize category/subcategory from already loaded data
  useEffect(() => {
    if (categorySlug && categories.length > 0 && !currentCategory) {
      const found = categories.find(cat => 
        cat.slug?.toLowerCase() === categorySlug.toLowerCase()
      );
      if (found) {
        console.log('Found category from array:', found);
        setCurrentCategory(found);
      }
    }
    
    if (subCategorySlug && subcategories.length > 0 && !currentSubcategory) {
      const found = subcategories.find(sub => 
        sub.slug?.toLowerCase() === subCategorySlug.toLowerCase()
      );
      if (found) {
        console.log('Found subcategory from array:', found);
        setCurrentSubcategory(found);
      }
    }
  }, [categories, subcategories, categorySlug, subCategorySlug]);

  // Fetch category/subcategory details
  useEffect(() => {
    if (categorySlug && categories.length > 0) {
      fetchCategoryData();
    }
    if (subCategorySlug && subcategories.length > 0) {
      fetchSubcategoryData();
    }
  }, [categorySlug, subCategorySlug, categories, subcategories]);

  useEffect(() => {
    parseFiltersFromURL();
  }, [categorySlug, subCategorySlug, collectionSlug, searchParams]);

  useEffect(() => {
    if (showProducts) updateURL();
  }, [activeFilters, sortBy, currentPage]);

  // IMPORTANT: Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_APP_BASE_URL}/products`),
        fetch(`${import.meta.env.VITE_APP_BASE_URL}/categories`),
        fetch(`${import.meta.env.VITE_APP_BASE_URL}/subcategories`)
      ]);

      if (!productsRes.ok || !categoriesRes.ok || !subcategoriesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [productsData, categoriesData, subcategoriesData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        subcategoriesRes.json()
      ]);

      console.log('Loaded categories:', categoriesData);
      console.log('Loaded subcategories:', subcategoriesData);

      setAllProducts(productsData);
      setCategories(categoriesData);
      setSubcategories(subcategoriesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/categories/slug/${categorySlug}`);
      if (!response.ok) {
        console.error('Category fetch failed:', response.status, response.statusText);
        const foundCategory = categories.find(cat => 
          cat.slug?.toLowerCase() === categorySlug.toLowerCase()
        );
        if (foundCategory) {
          console.log('Using fallback category:', foundCategory);
          setCurrentCategory(foundCategory);
        }
        return;
      }
      const data = await response.json();
      console.log('Fetched category data:', data);
      setCurrentCategory(data);
    } catch (err) {
      console.error('Error fetching category:', err);
      const foundCategory = categories.find(cat => 
        cat.slug?.toLowerCase() === categorySlug.toLowerCase()
      );
      if (foundCategory) {
        console.log('Using fallback category after error:', foundCategory);
        setCurrentCategory(foundCategory);
      }
    }
  };

  const fetchSubcategoryData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/subcategories/slug/${subCategorySlug}`);
      if (!response.ok) {
        console.error('Subcategory fetch failed:', response.status, response.statusText);
        const foundSubcategory = subcategories.find(sub => 
          sub.slug?.toLowerCase() === subCategorySlug.toLowerCase()
        );
        if (foundSubcategory) {
          console.log('Using fallback subcategory:', foundSubcategory);
          setCurrentSubcategory(foundSubcategory);
        }
        return;
      }
      const data = await response.json();
      console.log('Fetched subcategory data:', data);
      setCurrentSubcategory(data);
    } catch (err) {
      console.error('Error fetching subcategory:', err);
      const foundSubcategory = subcategories.find(sub => 
        sub.slug?.toLowerCase() === subCategorySlug.toLowerCase()
      );
      if (foundSubcategory) {
        console.log('Using fallback subcategory after error:', foundSubcategory);
        setCurrentSubcategory(foundSubcategory);
      }
    }
  };
  const parseFiltersFromURL = () => {
    const filters = { ...activeFilters };
    let pageFromURL = 1;
    
    searchParams.forEach((value, key) => {
      if (key === 'sort') setSortBy(value);
      else if (key === 'page') pageFromURL = parseInt(value) || 1;
      else if (key !== 'q' && key in filters) {
        filters[key] = value.split(',');
      }
    });
    
    setActiveFilters(filters);
    setCurrentPage(pageFromURL);
  };

  const updateURL = () => {
    const params = new URLSearchParams(searchParams);
    Object.keys(activeFilters).forEach(key => params.delete(key));
    params.delete('sort');
    params.delete('page');
    
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values.length > 0) params.set(key, values.join(','));
    });
    
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  };

  const filteredSubcategories = useMemo(() => {
    if (!categorySlug) return [];
    return subcategories.filter(sub => 
      sub.categorySlug?.toLowerCase() === categorySlug.toLowerCase() ||
      sub.category?.toLowerCase() === categorySlug.toLowerCase()
    );
  }, [subcategories, categorySlug]);

  const getFilteredProductsByRoute = useMemo(() => {
    const searchQuery = searchParams.get('q');
    let filtered = [...allProducts];
    
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
        return (
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.subCategory?.toLowerCase().includes(query) ||
          product.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          product.details?.metal?.toLowerCase().includes(query) ||
          product.details?.stone?.toLowerCase().includes(query) ||
          product.sku?.toLowerCase().includes(query)
        );
      });
    }
    else if (collectionSlug) {
      filtered = filtered.filter(product => 
        product.collection?.toLowerCase() === collectionSlug.toLowerCase() ||
        product.collectionSlug?.toLowerCase() === collectionSlug.toLowerCase() ||
        product.tags?.some(tag => tag.toLowerCase() === collectionSlug.toLowerCase())
      );
    }
    else if (subCategorySlug) {
      filtered = filtered.filter(product => {
        const productSubCat = (product.subCategory || product.subcategory || '').toLowerCase();
        const productSubCatSlug = (product.subCategorySlug || product.subcategorySlug || '').toLowerCase();
        return productSubCat === subCategorySlug.toLowerCase() || 
               productSubCatSlug === subCategorySlug.toLowerCase();
      });
    }
    else if (categorySlug) {
      filtered = filtered.filter(product => {
        const productCat = (product.category || '').toLowerCase();
        const productCatSlug = (product.categorySlug || '').toLowerCase();
        return productCat === categorySlug.toLowerCase() || 
               productCatSlug === categorySlug.toLowerCase();
      });
    }
    
    return filtered;
  }, [allProducts, categorySlug, subCategorySlug, collectionSlug, searchParams]);

  const extractUniqueValues = (field) => {
    const values = new Set();
    getFilteredProductsByRoute.forEach(product => {
      const value = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj?.[key], product)
        : product[field];
      
      if (Array.isArray(value)) {
        value.forEach(v => v && values.add(v));
      } else if (value) {
        values.add(value);
      }
    });
    return Array.from(values).sort();
  };

  const filterOptions = useMemo(() => ({
    metals: extractUniqueValues('details.metal'),
    metalPurities: extractUniqueValues('details.metalPurity'),
    stones: extractUniqueValues('details.stone'),
    stoneTypes: extractUniqueValues('details.stoneType'),
    clarities: extractUniqueValues('details.clarity'),
    sizes: extractUniqueValues('details.size'),
    colors: extractUniqueValues('details.color'),
    certifications: extractUniqueValues('details.certification'),
    tags: extractUniqueValues('tags'),
    subcategories: categorySlug && !subCategorySlug ? filteredSubcategories.map(sub => sub.name) : []
  }), [getFilteredProductsByRoute, filteredSubcategories, categorySlug, subCategorySlug]);

  const priceRanges = [
    { label: 'Under ₹10,000', min: 0, max: 10000 },
    { label: '₹10,000 - ₹25,000', min: 10000, max: 25000 },
    { label: '₹25,000 - ₹50,000', min: 25000, max: 50000 },
    { label: '₹50,000 - ₹1,00,000', min: 50000, max: 100000 },
    { label: 'Above ₹1,00,000', min: 100000, max: Infinity }
  ];

  const discountRanges = [
    { label: '10% & Above', min: 10 },
    { label: '20% & Above', min: 20 },
    { label: '30% & Above', min: 30 },
    { label: '40% & Above', min: 40 }
  ];

  const filteredProducts = useMemo(() => {
    return getFilteredProductsByRoute.filter(product => {
      if (activeFilters.priceRanges.length > 0) {
        const price = product.pricing?.discountedPrice || product.pricing?.basePrice || 0;
        const matchesPrice = activeFilters.priceRanges.some(range => {
          const r = priceRanges.find(pr => pr.label === range);
          return price >= r.min && price < r.max;
        });
        if (!matchesPrice) return false;
      }

      if (activeFilters.metals.length > 0 && !activeFilters.metals.includes(product.details?.metal)) return false;
      if (activeFilters.metalPurities.length > 0 && !activeFilters.metalPurities.includes(product.details?.metalPurity)) return false;
      if (activeFilters.stones.length > 0 && !activeFilters.stones.includes(product.details?.stone)) return false;
      if (activeFilters.stoneTypes.length > 0 && !activeFilters.stoneTypes.includes(product.details?.stoneType)) return false;
      if (activeFilters.clarities.length > 0 && !activeFilters.clarities.includes(product.details?.clarity)) return false;
      if (activeFilters.sizes.length > 0 && !activeFilters.sizes.includes(product.details?.size)) return false;
      if (activeFilters.colors.length > 0 && !activeFilters.colors.includes(product.details?.color)) return false;
      if (activeFilters.certifications.length > 0 && !activeFilters.certifications.includes(product.details?.certification)) return false;

      if (activeFilters.discounts.length > 0) {
        const hasDiscount = product.pricing?.discountedPrice && product.pricing.discountedPrice < product.pricing.basePrice;
        if (!hasDiscount) return false;
        
        const discountPercent = ((product.pricing.basePrice - product.pricing.discountedPrice) / product.pricing.basePrice) * 100;
        const matchesDiscount = activeFilters.discounts.some(range => {
          const r = discountRanges.find(dr => dr.label === range);
          return discountPercent >= r.min;
        });
        if (!matchesDiscount) return false;
      }

      if (activeFilters.availability.length > 0) {
        const inStock = product.inventory?.inStock && product.inventory.stock > 0;
        if (activeFilters.availability.includes('In Stock') && !inStock) return false;
        if (activeFilters.availability.includes('Out of Stock') && inStock) return false;
      }

      if (activeFilters.tags.length > 0) {
        const hasTag = activeFilters.tags.some(tag => product.tags?.includes(tag));
        if (!hasTag) return false;
      }

      if (activeFilters.subcategories.length > 0) {
        const productSubCat = product.subCategory || product.subcategory || '';
        const matchesSubcategory = activeFilters.subcategories.some(subName => {
          const subcat = filteredSubcategories.find(s => s.name === subName);
          return subcat && (
            productSubCat.toLowerCase() === subcat.name.toLowerCase() ||
            productSubCat.toLowerCase() === subcat.slug?.toLowerCase()
          );
        });
        if (!matchesSubcategory) return false;
      }

      return true;
    });
  }, [getFilteredProductsByRoute, activeFilters, filteredSubcategories]);
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch (sortBy) {
      case 'price_asc':
        sorted.sort((a, b) => (a.pricing?.discountedPrice || a.pricing?.basePrice || 0) - (b.pricing?.discountedPrice || b.pricing?.basePrice || 0));
        break;
      case 'price_desc':
        sorted.sort((a, b) => (b.pricing?.discountedPrice || b.pricing?.basePrice || 0) - (a.pricing?.discountedPrice || a.pricing?.basePrice || 0));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'discount':
        sorted.sort((a, b) => {
          const discA = a.pricing?.discountedPrice ? ((a.pricing.basePrice - a.pricing.discountedPrice) / a.pricing.basePrice) * 100 : 0;
          const discB = b.pricing?.discountedPrice ? ((b.pricing.basePrice - b.pricing.discountedPrice) / b.pricing.basePrice) * 100 : 0;
          return discB - discA;
        });
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    
    return sorted;
  }, [filteredProducts, sortBy]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => {
      const current = prev[filterType];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [filterType]: updated };
    });
    setCurrentPage(1);
  };

  const handleSubcategoryClick = (subcategory) => {
    if (subcategory.slug) {
      navigate(`/products/category/${categorySlug}/${subcategory.slug}`);
      setCurrentPage(1);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({
      priceRanges: [], metals: [], metalPurities: [], stones: [], stoneTypes: [],
      clarities: [], sizes: [], colors: [], certifications: [], discounts: [],
      availability: [], tags: [], subcategories: []
    });
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);
  };

  const getPageTitle = () => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (subCategorySlug) return currentSubcategory?.name || subCategorySlug.replace(/-/g, ' ');
    if (collectionSlug) return collectionSlug.replace(/-/g, ' ');
    if (categorySlug) return currentCategory?.name || categorySlug.replace(/-/g, ' ');
    return 'All Products';
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [{ label: 'Home', path: '/' }];
    
    if (categorySlug) {
      breadcrumbs.push({ 
        label: currentCategory?.name || categorySlug.replace(/-/g, ' '), 
        path: `/products/category/${categorySlug}` 
      });
    }
    if (subCategorySlug) {
      breadcrumbs.push({ 
        label: currentSubcategory?.name || subCategorySlug.replace(/-/g, ' '), 
        path: null 
      });
    }
    if (collectionSlug) {
      breadcrumbs.push({ 
        label: collectionSlug.replace(/-/g, ' '), 
        path: null 
      });
    }
    
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      breadcrumbs.push({ label: searchQuery, path: null });
    }
    
    if (!categorySlug && !subCategorySlug && !collectionSlug && !searchQuery) {
      breadcrumbs.push({ label: 'All Products', path: null });
    }
    
    return breadcrumbs;
  };

  // Carousel Functions
  const updateCarouselButtons = () => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    setScrollPosition(el.scrollLeft);
  };

  const scrollCarousel = (dir) => {
    if (!carouselRef.current) return;
    const cardWidth = window.innerWidth < 640 ? 120 : window.innerWidth < 768 ? 140 : 160;
    carouselRef.current.scrollBy({
      left: dir === "left" ? -cardWidth * 2 : cardWidth * 2,
      behavior: "smooth",
    });
    setTimeout(updateCarouselButtons, 300);
  };

  // Update carousel buttons when subcategories change
  useEffect(() => {
    updateCarouselButtons();
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateCarouselButtons);
    window.addEventListener("resize", updateCarouselButtons);
    return () => {
      el.removeEventListener("scroll", updateCarouselButtons);
      window.removeEventListener("resize", updateCarouselButtons);
    };
  }, [filteredSubcategories]);
  if (loading) {
    return <Loading/>;
  }

  if (error) {
    return (
      <div className="min-h-screen w-screen bg-white">
        <MainHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <SearchX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={fetchAllData} className="bg-[#10254b] text-white px-6 py-2 rounded-lg hover:bg-[#0d1e3d]">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <MainHeader />
      <div className="min-h-screen w-screen bg-white">
        <div className="w-screen px-4 py-6 md:py-8">
          
         {/* Banner Section - Show for both Category and Subcategory based on route */}
          {(() => {
            if (subCategorySlug && currentSubcategory) {
              return (
                <div className="max-w-7xl mx-auto mb-8">
                  <div className="relative h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden bg-gray-200 mb-6">
                    <img
                      src={
                        currentSubcategory.bannerImage || 
                        currentSubcategory.image || 
                        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200'
                      }
                      alt={currentSubcategory.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200';
                      }}
                    />
                  </div>
                  
                  <div className="text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl text-[#10254b] tracking-tight capitalize mb-3" style={{fontFamily: "serif"}}>
                      {currentSubcategory.name}
                    </h1>
                    {currentSubcategory.description && (
                      <p className="text-gray-600 text-sm md:text-base max-w-3xl mx-auto " style={{fontFamily:"sans-serif"}}>
                        {currentSubcategory.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            }
            
            if (categorySlug && !subCategorySlug && currentCategory) {
              return (
                <div className="max-w-7xl mx-auto mb-8">
                  <div className="relative h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden bg-gray-200 mb-6">
                    <img
                      src={
                        currentCategory?.bannerImage || 
                        currentCategory?.image || 
                        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200'
                      }
                      alt={currentCategory?.name || categorySlug}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200';
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl text-[#10254b] tracking-tight capitalize mb-3" style={{fontFamily: "serif"}}>
                      {currentCategory?.name || categorySlug?.replace(/-/g, ' ')}
                    </h1>
                    {currentCategory?.description && (
                      <p className="text-gray-600 text-sm md:text-base max-w-3xl mx-auto" style={{fontFamily:"sans-serif"}}>
                        {currentCategory.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Breadcrumbs */}
          <div className="max-w-7xl mx-auto mb-6">
            <nav className="flex items-center gap-2 text-sm sm:text-base md:text-lg lg:text-xl font-medium mb-4 font-serif">
              {getBreadcrumbs().map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  {crumb.path ? (
                    <a href={crumb.path} className="text-gray-700 hover:text-[#10254b] capitalize transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-[#10254b] font-semibold capitalize">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>

            {/* Sort Bar Only - No Filter Button */}
            <div className="flex items-center justify-start gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden sm:inline">Sort by</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:border-[#10254b] cursor-pointer font-medium">
                  <option value="relevance">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="discount">Highest Discount</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subcategory Carousel - Always show when in a category */}
          {categorySlug && filteredSubcategories.length > 0 && (
            <div className="max-w-7xl mx-auto mb-8">
             
                <h2 className="text-xl align-center font-serif text-gray-900 mb-4">Explore Categories</h2>
                
                <div className="relative">
                 

                  {/* Left Arrow */}
                  {canScrollLeft && (
                    <button
                      onClick={() => scrollCarousel("left")}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl rounded-full p-2 hover:bg-gray-50 transition-all hover:scale-110 border border-gray-200"style={{ marginLeft: "-12px" }}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}

              {/* Right Arrow */}
              {canScrollRight && (
                <button
                  onClick={() => scrollCarousel("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl rounded-full p-2 hover:bg-gray-50 transition-all hover:scale-110 border border-gray-200"
                  style={{ marginRight: "-12px" }}
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              )}

              {/* Scrollable Container */}
              <div
                ref={carouselRef}
                className="flex gap-3 py-4 overflow-x-auto pb-2"
                style={{
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <style>{`
                  div[style*="scrollSnapType"]::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>

                {filteredSubcategories.map((sub) => (
                  <div
                    key={sub.id || sub._id}
                    onClick={() => handleSubcategoryClick(sub)}
                    className={`flex-shrink-0 w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px] rounded-xl overflow-hidden cursor-pointer group relative border-2 transition-all ${
                      subCategorySlug === sub.slug
                        ? 'border-[#10254b] shadow-lg scale-105'
                        : 'border-transparent hover:border-[#10254b] hover:shadow-md'
                    }`}
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <img
                      src={sub.image || sub.bannerImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300'}
                      alt={sub.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                      <p className="text-white text-xs sm:text-sm font-medium line-clamp-2 leading-tight">
                        {sub.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
               {/* Dots for mobile */}
                  <div className="flex justify-center gap-1.5 mb-4 md:hidden">
                    {Array.from({ length: Math.min(filteredSubcategories.length, 5) }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${
                          Math.floor(scrollPosition / 120) === idx ? "w-6 bg-[#10254b]" : "w-1.5 bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
            </div>
          </div>
        
      )}
      

      {/* Products Grid */}

      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl align-center font-serif text-gray-900 mb-4">Products</h2>
        {paginatedProducts.length === 0 ? (
          <div className="text-center py-20">
            <SearchX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-medium text-gray-900 mb-3">No Products Found</h3>
            <p className="text-gray-500 mb-8">Try selecting a different category</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {paginatedProducts.map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16 mb-8">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl border-2 border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#10254b] transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button 
                        key={page} 
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[44px] h-11 rounded-xl font-semibold transition-all ${
                          currentPage === page
                            ? 'bg-[#10254b] text-white shadow-lg scale-110'
                            : 'border-2 border-gray-300 hover:border-[#10254b]'
                        }`}>
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-xl border-2 border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#10254b] transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  </div>
</>
);
};
export default ProductsListingPage;