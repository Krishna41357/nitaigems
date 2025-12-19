import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, X, SearchX } from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import MainHeader from "../components/homepage/MainHeader";

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
  const [showFilters, setShowFilters] = useState(false);
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
    tags: []
  });

  // Determine what to show
  const showSubcategories = categorySlug && !subCategorySlug && !collectionSlug && !searchParams.get('q');
  const showProducts = !categorySlug || subCategorySlug || collectionSlug || searchParams.get('q');

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
    setCurrentPage(1);
  }, [categorySlug, subCategorySlug, collectionSlug, searchParams]);

  useEffect(() => {
    if (showProducts) updateURL();
  }, [activeFilters, sortBy, currentPage]);

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
    searchParams.forEach((value, key) => {
      if (key === 'sort') setSortBy(value);
      else if (key === 'page') setCurrentPage(parseInt(value));
      else if (key !== 'q' && key in filters) {
        filters[key] = value.split(',');
      }
    });
    setActiveFilters(filters);
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

  // Get subcategories for category
  const filteredSubcategories = useMemo(() => {
    if (!categorySlug) return [];
    return subcategories.filter(sub => 
      sub.categorySlug?.toLowerCase() === categorySlug.toLowerCase() ||
      sub.category?.toLowerCase() === categorySlug.toLowerCase()
    );
  }, [subcategories, categorySlug]);

  // Product filtering
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
      // Filter by category only when we're showing products for a category
      filtered = filtered.filter(product => {
        const productCat = (product.category || '').toLowerCase();
        const productCatSlug = (product.categorySlug || '').toLowerCase();
        return productCat === categorySlug.toLowerCase() || 
               productCatSlug === categorySlug.toLowerCase();
      });
    }
    // If no route params at all (/products), show all products (no filtering)
    
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
    tags: extractUniqueValues('tags')
  }), [getFilteredProductsByRoute]);

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

      return true;
    });
  }, [getFilteredProductsByRoute, activeFilters]);

  // PART 1 ENDS HERE - CONTINUE WITH PART 2
  // PART 2: Sorting, Pagination, Components, and UI (continuing from Part 1)

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

  const clearAllFilters = () => {
    setActiveFilters({
      priceRanges: [], metals: [], metalPurities: [], stones: [], stoneTypes: [],
      clarities: [], sizes: [], colors: [], certifications: [], discounts: [],
      availability: [], tags: []
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
    
    // If no route params, just show "All Products"
    if (!categorySlug && !subCategorySlug && !collectionSlug && !searchQuery) {
      breadcrumbs.push({ label: 'All Products', path: null });
    }
    
    return breadcrumbs;
  };

  // Subcategory Card Component
  const SubcategoryCard = ({ subcategory }) => (
    <div
      onClick={() => navigate(`/products/category/${categorySlug}/${subcategory.slug}`)}
      className="group cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-[#832729] transition-all duration-300 hover:shadow-xl"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={subcategory.image || subcategory.bannerImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600'}
          alt={subcategory.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600';
          }}
        />
      </div>
      <div className="p-4 text-center">
        <h3 className="text-lg font-medium text-gray-900 group-hover:text-[#832729] transition-colors capitalize">
          {subcategory.name}
        </h3>
        {subcategory.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {subcategory.description}
          </p>
        )}
      </div>
    </div>
  );

  const FilterSection = ({ title, filterKey, options }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center justify-between bg-transparent border-none w-full py-3.5 px-5">
          <span className="font-semibold text-[15px] text-black">{title}</span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {expanded && (
          <div className="pb-4 px-5">
            {options.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No options available</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {options.map(option => (
                  <button key={option} onClick={() => handleFilterChange(filterKey, option)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                      activeFilters[filterKey].includes(option)
                        ? 'bg-[#832729] text-white border-[#832729] font-medium'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}>
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const PriceRangeFilter = () => {
    const [expanded, setExpanded] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const handleApplyCustomRange = () => {
      const min = parseFloat(minPrice) || 0;
      const max = parseFloat(maxPrice) || Infinity;
      const customLabel = `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
      handleFilterChange('priceRanges', customLabel);
      setMinPrice('');
      setMaxPrice('');
    };

    return (
      <div className="border-b border-gray-200">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center bg-transparent border-none justify-between w-full py-3.5 px-5">
          <span className="font-semibold text-[15px] text-black">Price</span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {expanded && (
          <div className="pb-4 px-5 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {priceRanges.map(range => (
                <button key={range.label} onClick={() => handleFilterChange('priceRanges', range.label)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                    activeFilters.priceRanges.includes(range.label)
                      ? 'bg-[#832729] text-white border-[#832729] font-medium'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}>
                  {range.label}
                </button>
              ))}
            </div>
            <div className="pt-1">
              <p className="text-xs text-gray-600 mb-2">Custom Range</p>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#832729]" />
                <span className="text-gray-500 text-xs font-medium">to</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#832729]" />
              </div>
              {(minPrice || maxPrice) && (
                <button onClick={handleApplyCustomRange}
                  className="mt-2 w-full py-1.5 bg-[#832729] text-white text-xs rounded hover:bg-[#6A1F21] transition-colors">
                  Apply
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-white py-12">
        <MainHeader />
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#832729] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
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
            <button onClick={fetchAllData} className="bg-[#832729] text-white px-6 py-2 rounded-lg hover:bg-[#6A1F21]">
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
        <div className="w-screen px-4 md:px-8 lg:px-12 py-6 md:py-8">
          
         {/* Banner Section - Show for both Category and Subcategory based on route */}
          {(() => {
            // Show subcategory banner if we're in a subcategory route
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
                    <h1 className="text-3xl md:text-4xl lg:text-5xl text-red-900 tracking-tight capitalize mb-3" style={{fontFamily: "serif"}}>
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
            
            // Show category banner if we're in a category route (but not subcategory)
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
                    <h1 className="text-3xl md:text-4xl lg:text-5xl text-red-900 tracking-tight capitalize mb-3" style={{fontFamily: "serif"}}>
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
           <nav className="
  flex items-center gap-2 base
  text-sm sm:text- md:text-lg lg:text-xl
  font-medium mb-4
  font-serif
">

              {getBreadcrumbs().map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  {crumb.path ? (
                    <a href={crumb.path} className="text-gray-700 hover:text-[#832729] capitalize transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-[#832729] font-semibold capitalize">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>

            {/* Filter and Sort Bar - Only show when showing products */}
            {showProducts && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <button onClick={() => setShowFilters(true)}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M4 6h16M7 12h10M10 18h4" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className="font-medium">FILTER</span>
                    {getActiveFilterCount() > 0 && (
                      <span className="bg-[#832729] text-white text-xs font-semibold px-1.5 py-0.5 rounded min-w-[18px] text-center">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 hidden sm:inline">Sort by</span>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:border-[#832729] cursor-pointer font-medium">
                      <option value="relevance">Recommended</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                      <option value="discount">Highest Discount</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>
                </div>

                {getActiveFilterCount() > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <button onClick={clearAllFilters}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-full text-xs font-medium hover:bg-gray-800 transition-colors">
                        <X className="w-3 h-3" />
                        Clear All
                      </button>
                      <div className="flex flex-wrap items-center gap-2">
                        {Object.entries(activeFilters).map(([key, values]) =>
                          values.map(value => (
                            <span key={`${key}-${value}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {value}
                              <button onClick={() => handleFilterChange(key, value)}
                                className="hover:bg-gray-200 rounded-full p-0.5">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* SHOW SUBCATEGORIES */}
          {showSubcategories && (
            <div className="max-w-7xl mx-auto">
              
              {filteredSubcategories.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500">No subcategories available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {filteredSubcategories.map(subcategory => (
                    <SubcategoryCard key={subcategory.id || subcategory._id} subcategory={subcategory} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SHOW PRODUCTS */}
          {showProducts && (
            <div className="max-w-7xl mx-auto">
              {paginatedProducts.length === 0 ? (
                <div className="text-center py-20">
                  <SearchX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-medium text-gray-900 mb-3">No Products Found</h3>
                  <p className="text-gray-500 mb-8">Try adjusting your filters</p>
                  <button onClick={clearAllFilters}
                    className="bg-[#832729] text-white px-8 py-3 rounded-xl hover:bg-[#6A1F21] transition-colors">
                    Clear All Filters
                  </button>
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
                      <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-3 rounded-xl border-2 border-gray-300 disabled:opacity-40 hover:border-[#832729] transition-all">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                          return (
                            <button key={page} onClick={() => setCurrentPage(page)}
                              className={`min-w-[44px] h-11 rounded-xl font-semibold transition-all ${
                                currentPage === page
                                  ? 'bg-[#832729] text-white shadow-lg scale-110'
                                  : 'border-2 border-gray-300 hover:border-[#832729]'
                              }`}>
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2 text-gray-400">...</span>;
                        }
                        return null;
                      })}
                      <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-3 rounded-xl border-2 border-gray-300 disabled:opacity-40 hover:border-[#832729] transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* FIXED Filters Sidebar */}
          {showFilters && (
            <div className="fixed inset-0 z-50">
              <div 
                className="absolute inset-0 bg-black/40" 
                onClick={() => setShowFilters(false)} 
              />
              
              <div className="absolute left-0 top-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl flex flex-col animate-slideIn">
                <div className="flex-shrink-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-serif text-red-800">Filter By</h2>
                  <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto mx-4 my-3 border border-gray-300 rounded-2xl custom-scrollbar">
                  <PriceRangeFilter />
                  <FilterSection title="Jewellery Type" filterKey="metals" options={filterOptions.metals} />
                  <FilterSection title="Product" filterKey="metalPurities" options={filterOptions.metalPurities} />
                  <FilterSection title="Brand" filterKey="stones" options={filterOptions.stones} />
                  <FilterSection title="Gender" filterKey="clarities" options={filterOptions.clarities} />
                  <FilterSection title="Occasion" filterKey="tags" options={filterOptions.tags} />
                  <FilterSection title="Metal" filterKey="stoneTypes" options={filterOptions.stoneTypes} />
                  <FilterSection title="Size" filterKey="sizes" options={filterOptions.sizes} />
                  <FilterSection title="Certification" filterKey="certifications" options={filterOptions.certifications} />
                  <FilterSection title="Discount" filterKey="discounts" options={discountRanges.map(r => r.label)} />
                  <FilterSection title="Availability" filterKey="availability" options={['In Stock', 'Out of Stock']} />
                </div>
                
                <div className="flex-shrink-0 bg-white border-t px-5 py-3.5 flex gap-3">
                  <button onClick={clearAllFilters}
                    className="flex-1 py-2.5 border border-[#832729] rounded-full text-[#832729] hover:bg-red-50">
                    Clear Filters
                  </button>
                  <button onClick={() => setShowFilters(false)}
                    className="flex-1 py-2.5 bg-[#832729] text-white rounded-full hover:bg-[#6A1F21]">
                    Show Results ({sortedProducts.length})
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c0c0c0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0a0a0;
        }
      `}</style>
    </>
  );
};

export default ProductsListingPage;