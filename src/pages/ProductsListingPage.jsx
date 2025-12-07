import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, X, SearchX } from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import MainHeader from "../components/homepage/MainHeader";



const ProductsListingPage = () => {
  const { categorySlug, subCategorySlug, collectionSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [allProducts, setAllProducts] = useState([]); // All products loaded once
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

  // Fetch ALL products only once on mount
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Parse filters from URL when params change
  useEffect(() => {
    parseFiltersFromURL();
    setCurrentPage(1); // Reset to page 1 when route changes
  }, [categorySlug, subCategorySlug, collectionSlug, searchParams]);

  // Update URL when filters change
  useEffect(() => {
    updateURL();
  }, [activeFilters, sortBy, currentPage]);

  const fetchAllProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `${import.meta.env.VITE_APP_BASE_URL}/products`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setAllProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const parseFiltersFromURL = () => {
    const filters = { ...activeFilters };
    
    searchParams.forEach((value, key) => {
      if (key === 'sort') setSortBy(value);
      else if (key === 'page') setCurrentPage(parseInt(value));
      else if (key !== 'q' && key in filters) { // Exclude 'q' from filters
        filters[key] = value.split(',');
      }
    });
    
    setActiveFilters(filters);
  };

  const updateURL = () => {
    const params = new URLSearchParams(searchParams); // Preserve existing params like 'q'
    
    // Remove old filter params
    Object.keys(activeFilters).forEach(key => params.delete(key));
    params.delete('sort');
    params.delete('page');
    
    // Add current filters
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(','));
      }
    });
    
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params, { replace: true });
  };

  // Client-side filtering based on route (category/subcategory/search)
  const getFilteredProductsByRoute = useMemo(() => {
    const searchQuery = searchParams.get('q');
    let filtered = [...allProducts];
    
    // Filter by search query (highest priority)
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
    // Filter by collection
    else if (collectionSlug) {
      filtered = filtered.filter(product => 
        product.collection?.toLowerCase() === collectionSlug.toLowerCase() ||
        product.collectionSlug?.toLowerCase() === collectionSlug.toLowerCase() ||
        product.tags?.some(tag => tag.toLowerCase() === collectionSlug.toLowerCase())
      );
    }
    // Filter by subcategory
    else if (subCategorySlug) {
      filtered = filtered.filter(product => {
        const productSubCat = (product.subCategory || product.subcategory || '').toLowerCase();
        const productSubCatSlug = (product.subCategorySlug || product.subcategorySlug || '').toLowerCase();
        return productSubCat === subCategorySlug.toLowerCase() || 
               productSubCatSlug === subCategorySlug.toLowerCase();
      });
    }
    // Filter by category
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

  // Extract unique values for filter options from route-filtered products
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

  // Apply user-selected filters on top of route filtering
 const filteredProducts = useMemo(() => {
  return getFilteredProductsByRoute.filter(product => {
    // Price filter
    if (activeFilters.priceRanges.length > 0) {
      const price = product.pricing?.discountedPrice || product.pricing?.basePrice || 0;
      const matchesPrice = activeFilters.priceRanges.some(range => {
        const r = priceRanges.find(pr => pr.label === range);
        return price >= r.min && price < r.max;
      });
      if (!matchesPrice) return false;
    }

    // Metal filter
    if (activeFilters.metals.length > 0) {
      if (!product.details?.metal || !activeFilters.metals.includes(product.details.metal)) {
        return false;
      }
    }

    // Metal Purity filter
    if (activeFilters.metalPurities.length > 0) {
      if (!product.details?.metalPurity || !activeFilters.metalPurities.includes(product.details.metalPurity)) {
        return false;
      }
    }

    // Stone filter
    if (activeFilters.stones.length > 0) {
      if (!product.details?.stone || !activeFilters.stones.includes(product.details.stone)) {
        return false;
      }
    }

    // Stone Type filter
    if (activeFilters.stoneTypes.length > 0) {
      if (!product.details?.stoneType || !activeFilters.stoneTypes.includes(product.details.stoneType)) {
        return false;
      }
    }

    // Clarity filter
    if (activeFilters.clarities.length > 0) {
      if (!product.details?.clarity || !activeFilters.clarities.includes(product.details.clarity)) {
        return false;
      }
    }

    // Size filter
    if (activeFilters.sizes.length > 0) {
      if (!product.details?.size || !activeFilters.sizes.includes(product.details.size)) {
        return false;
      }
    }

    // Color filter
    if (activeFilters.colors.length > 0) {
      if (!product.details?.color || !activeFilters.colors.includes(product.details.color)) {
        return false;
      }
    }

    // Certification filter
    if (activeFilters.certifications.length > 0) {
      if (!product.details?.certification || !activeFilters.certifications.includes(product.details.certification)) {
        return false;
      }
    }

    // Discount filter
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

    // Availability filter
    if (activeFilters.availability.length > 0) {
      const inStock = product.inventory?.inStock && product.inventory.stock > 0;
      if (activeFilters.availability.includes('In Stock') && !inStock) return false;
      if (activeFilters.availability.includes('Out of Stock') && inStock) return false;
    }

    // Tags filter
    if (activeFilters.tags.length > 0) {
      const hasTag = activeFilters.tags.some(tag => product.tags?.includes(tag));
      if (!hasTag) return false;
    }

    return true;
  });
}, [getFilteredProductsByRoute, activeFilters]);
  // Sorting logic (same as before)
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch (sortBy) {
      case 'price_asc':
        sorted.sort((a, b) => {
          const priceA = a.pricing?.discountedPrice || a.pricing?.basePrice || 0;
          const priceB = b.pricing?.discountedPrice || b.pricing?.basePrice || 0;
          return priceA - priceB;
        });
        break;
      case 'price_desc':
        sorted.sort((a, b) => {
          const priceA = a.pricing?.discountedPrice || a.pricing?.basePrice || 0;
          const priceB = b.pricing?.discountedPrice || b.pricing?.basePrice || 0;
          return priceB - priceA;
        });
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

  // Pagination (same as before)
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
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
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);
  };

  const getPageTitle = () => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (collectionSlug) return collectionSlug.replace(/-/g, ' ');
    if (subCategorySlug) return subCategorySlug.replace(/-/g, ' ');
    if (categorySlug) return categorySlug.replace(/-/g, ' ');
    return 'All Products';
  };

 // Replace the FilterSection component with this:
const FilterSection = ({ title, filterKey, options }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between bg-transparent border-none w-full py-3.5 px-5"
      >
        <span className="font-semibold text-[15px] text-black">{title}</span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {expanded && (
        <div className="pb-4 px-5">
          {options.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No options available</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {options.map(option => (
                <button
                  key={option}
                  onClick={() => handleFilterChange(filterKey, option)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                    activeFilters[filterKey].includes(option)
                      ? 'bg-[#832729] text-white border-[#832729] font-medium'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
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
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center bg-transparent border-none justify-between w-full py-3.5 px-5"
      >
        <span className="font-semibold text-[15px] text-black">Price</span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {expanded && (
        <div className="pb-4 px-5 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {priceRanges.map(range => (
              <button
                key={range.label}
                onClick={() => handleFilterChange('priceRanges', range.label)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                  activeFilters.priceRanges.includes(range.label)
                    ? 'bg-[#832729] text-white border-[#832729] font-medium'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <div className="pt-1">
            <p className="text-xs text-gray-600 mb-2">Custom Range</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#832729]"
              />
              <span className="text-gray-500 text-xs font-medium">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#832729]"
              />
            </div>
            {(minPrice || maxPrice) && (
              <button
                onClick={handleApplyCustomRange}
                className="mt-2 w-full py-1.5 bg-[#832729] text-white text-xs rounded hover:bg-[#6A1F21] transition-colors"
              >
                Apply
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};




    // ADD THIS NEW FUNCTION before the return statement
const getBreadcrumbs = () => {
  const breadcrumbs = [{ label: 'Home', path: '/' }];
  
  if (categorySlug) {
    breadcrumbs.push({ label: categorySlug.replace(/-/g, ' '), path: `/products/category/${categorySlug}` });
  }
  if (subCategorySlug) {
    breadcrumbs.push({ label: subCategorySlug.replace(/-/g, ' '), path: `/products/category/${categorySlug}/${subCategorySlug}` });
  }
  if (collectionSlug) {
    breadcrumbs.push({ label: collectionSlug.replace(/-/g, ' '), path: `/collections/${collectionSlug}` });
  }
  
  const searchQuery = searchParams.get('q');
  if (searchQuery) {
    breadcrumbs.push({ label: searchQuery, path: null });
  }
  
  return breadcrumbs;
};
    

 
if (loading) {
  return (
    <div className="min-h-screen w-screen bg-black/95 backdrop-blur-sm py-12 relative overflow-hidden">
      {/* Subtle golden glow */}
      <div className="absolute inset-0 bg-gradient-radial from-yellow-500/5 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Centered elegant loader */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] mb-12">
          <div className="relative inline-block mb-8">
            {/* Single golden rotating ring */}
            <div className="absolute inset-0 -m-6">
              <div className="w-36 h-36 border border-transparent border-t-yellow-500/70 rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
            </div>
            
            {/* Logo */}
            <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-full p-4 shadow-2xl shadow-yellow-500/20 backdrop-blur-sm border border-yellow-500/20">
              <img 
                src="./logo/logo.png" 
                alt="Nitai Gems" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          {/* Loading text */}
          <div className="space-y-4 text-center">
            <p className="text-yellow-500 text-2xl font-serif font-light tracking-widest">
              Nitai Gems
            </p>
            
            {/* Golden dots */}
            <div className="flex items-center justify-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
              <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></span>
              <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></span>
            </div>
            
            <p className="text-yellow-500/60 text-sm font-light tracking-wide">Loading Collection...</p>
          </div>
        </div>

        {/* Optional: Skeleton cards with golden theme */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-yellow-500/5 to-transparent rounded-lg border border-yellow-500/10 p-4">
              <div className="aspect-square bg-yellow-500/10 rounded mb-4 animate-pulse" />
              <div className="h-3 bg-yellow-500/10 rounded mb-2 animate-pulse" />
              <div className="h-3 bg-yellow-500/10 rounded w-2/3 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <SearchX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Products</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-[#8B4513] text-white px-6 py-2 rounded-lg hover:bg-[#6D3710]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <MainHeader/>
  <div className="min-h-screen w-screen bg-white">
  <div className="w-screen px-4 md:px-8 lg:px-12 py-6 md:py-8">
      {/* Elegant Page Header */}
      {/* Breadcrumb Navigation */}
<div className="max-w-7xl mx-auto mb-6">
  
  <nav className="flex items-center gap-2 text-sm">
    {getBreadcrumbs().map((crumb, index) => (
      <div key={index} className="flex items-center gap-2">
        {index > 0 && (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
        {crumb.path ? (
          <a href={crumb.path} className="text-gray-600 hover:text-[#832729] capitalize transition-colors">
            {crumb.label}
          </a>
        ) : (
          <span className="text-[#832729] font-medium capitalize">{crumb.label}</span>
        )}
      </div>
    ))}
  </nav>
</div>

{/* Page Title */}
<div className="max-w-7xl mx-auto mb-6">
  <h1 className="text-3xl md:text-4xl font-serif capitalize text-gray-900 mb-2">
    {getPageTitle()}
  </h1>
  <p className="text-gray-500 text-sm">
    {sortedProducts.length} exquisite piece{sortedProducts.length !== 1 ? 's' : ''}
  </p>
</div>

      {/* Filter and Sort Bar */}
<div className="max-w-7xl mx-auto mb-6">
  <div className="bg-white rounded-xl  border border-gray-200 py-4 px-4">
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Filter Button */}
      <button
        onClick={() => setShowFilters(true)}
        className="flex items-center rounded-2xl justify-center gap-2 px-5 py-2.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 6h16M7 12h10M10 18h4" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="font-medium font-serif text-brown">
          Filters
        </span>
        {getActiveFilterCount() > 0 && (
          <span className="bg-[#832729] text-white text-xs font-semibold px-2 py-0.5 rounded">
            {getActiveFilterCount()}
          </span>
        )}
      </button>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 hidden md:block">Sort By:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded bg-white text-sm text-gray-700 focus:outline-none focus:border-[#832729] cursor-pointer"
        >
          <option value="relevance">Relevance</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
          <option value="discount">Highest Discount</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>
    </div>

    {/* Active Filters Display */}
    {getActiveFilterCount() > 0 && (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(activeFilters).map(([key, values]) =>
            values.map(value => (
              <span
                key={`${key}-${value}`}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
              >
                {value}
                <button
                  onClick={() => handleFilterChange(key, value)}
                  className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
          <button
            onClick={clearAllFilters}
            className="text-sm text-[#832729] hover:underline font-medium ml-2"
          >
            Clear All
          </button>
        </div>
      </div>
    )}
  </div>
</div>
      {/* Products Grid */}
      <div className="max-w-7xl mx-auto">
       {loading ? (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
    {[...Array(12)].map((_, i) => (
      <div 
        key={i} 
        className="bg-gradient-to-br from-black/40 to-black/20 rounded-2xl overflow-hidden backdrop-blur-sm border border-yellow-500/10 shadow-lg"
        style={{
          animationDelay: `${i * 0.1}s`
        }}
      >
        {/* Image skeleton with shimmer effect */}
        <div className="aspect-square bg-gradient-to-br from-yellow-500/5 via-yellow-500/10 to-yellow-500/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent animate-shimmer" 
               style={{
                 animation: 'shimmer 2s infinite',
                 backgroundSize: '200% 100%'
               }}
          />
        </div>
        
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 rounded-full w-3/4 animate-pulse" />
          <div className="h-3 bg-gradient-to-r from-yellow-500/15 to-yellow-500/5 rounded-full w-1/2 animate-pulse" style={{animationDelay: '0.2s'}} />
          <div className="h-5 bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 rounded-full w-2/3 animate-pulse" style={{animationDelay: '0.4s'}} />
        </div>
      </div>
    ))}
  </div>
) : paginatedProducts.length === 0 ? (
  <div className="text-center py-20 md:py-32">
    <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-full mb-6 border border-yellow-500/20">
      <SearchX className="w-10 h-10 md:w-12 md:h-12 text-yellow-500/70" />
    </div>
    <h3 className="text-2xl md:text-3xl font-serif text-yellow-500 mb-3">No Treasures Found</h3>
    <p className="text-gray-400 mb-8 max-w-md mx-auto">
      We couldn't find any pieces matching your criteria. Try adjusting your filters to discover more.
    </p>
    <button
      onClick={clearAllFilters}
      className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-3 rounded-xl font-medium hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 transform hover:-translate-y-0.5"
    >
      Clear All Filters
    </button>
  </div>
) : (
  <>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
      {paginatedProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>

    {/* Elegant Pagination with Golden Theme */}
    {totalPages > 1 && (
      <div className="flex justify-center items-center gap-2 mt-16 mb-8">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-3 rounded-xl border-2 border-yellow-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:border-yellow-500 hover:bg-yellow-500/10 transition-all disabled:hover:border-yellow-500/20 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-5 h-5 text-yellow-500" />
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-[44px] h-11 rounded-xl font-semibold transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/30 scale-110'
                    : 'border-2 border-yellow-500/20 text-yellow-500 hover:border-yellow-500 hover:bg-yellow-500/10'
                }`}
              >
                {page}
              </button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page} className="px-2 text-yellow-500/40 font-medium">...</span>;
          }
          return null;
        })}

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-3 rounded-xl border-2 border-yellow-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:border-yellow-500 hover:bg-yellow-500/10 transition-all disabled:hover:border-yellow-500/20 disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-5 h-5 text-yellow-500" />
        </button>
      </div>
    )}
  </>
)}

{/* Add shimmer animation CSS */}
<style>{`
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
    background: linear-gradient(90deg, transparent, rgba(250, 204, 21, 0.2), transparent);
    background-size: 200% 100%;
  }
`}</style>
      </div>
    </div>

    {/* Luxurious Filters Sidebar */}
    {/* Filters Sidebar */}
{showFilters && (
  <div>
    <div
      className="fixed inset-0 bg-black/40 z-50 transition-opacity"
      onClick={() => setShowFilters(false)}
    />
    <div className="fixed left-0 top-0 bottom-0 w-full sm:w-[420px] bg-white z-50 shadow-2xl animate-slideIn flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
        <h2 className="text-xl font-serif tracking-wide text-red-800">Filter By</h2>
        <button
          onClick={() => setShowFilters(false)}
          className="p-1 bg-white hover:border-red-900 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      </div>
      
      {/* Scrollable Filter Sections - Takes 70% of remaining height */}
      <div className="flex-1 overflow-y-auto mx-4 my-3 border border-gray-300 rounded-2xl custom-scrollbar" style={{ maxHeight: 'calc(100vh - 140px)' }}>
  <div className="pb-2">
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
  
  /* Custom Scrollbar Styles */
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
          {/* Price Filter */}
          <PriceRangeFilter />
          
          {/* Metal Type Filter - uses details.metal */}
          <FilterSection
            title="Jewellery Type"
            filterKey="metals"
            options={filterOptions.metals}
          />
          
          {/* Metal Purity Filter - uses details.metalPurity */}
          <FilterSection
            title="Product"
            filterKey="metalPurities"
            options={filterOptions.metalPurities}
          />
          
          {/* Stone Filter - uses details.stone */}
          <FilterSection
            title="Brand"
            filterKey="stones"
            options={filterOptions.stones}
          />
          
          {/* Clarity Filter - uses details.clarity */}
          <FilterSection
            title="Gender"
            filterKey="clarities"
            options={filterOptions.clarities}
          />

          {/* Metal Purity as Purity */}
          <FilterSection
            title="Purity"
            filterKey="metalPurities"
            options={filterOptions.metalPurities}
          />
          
          {/* Tags Filter - uses tags array */}
          <FilterSection
            title="Occasion"
            filterKey="tags"
            options={filterOptions.tags}
          />

          {/* Stone Type Filter - uses details.stoneType */}
          <FilterSection
            title="Metal"
            filterKey="stoneTypes"
            options={filterOptions.stoneTypes}
          />

          {/* Color Filter - uses details.color */}
          <FilterSection
            title="Diamond Clarity"
            filterKey="colors"
            options={filterOptions.colors}
          />

          {/* Size Filter - uses details.size */}
          <FilterSection
            title="Size"
            filterKey="sizes"
            options={filterOptions.sizes}
          />

          {/* Certification Filter - uses details.certification */}
          <FilterSection
            title="Certification"
            filterKey="certifications"
            options={filterOptions.certifications}
          />

          {/* Discount Filter */}
          <FilterSection
            title="Discount"
            filterKey="discounts"
            options={discountRanges.map(r => r.label)}
          />

          {/* Availability Filter */}
          <FilterSection
            title="Availability"
            filterKey="availability"
            options={['In Stock', 'Out of Stock']}
          />
        </div>
      </div>

      {/* Bottom Action Buttons - Fixed at bottom */}
      <div className="flex-shrink-0 bg-white border-t border-red-900 px-5 py-3.5 flex gap-3">
        <button
          onClick={clearAllFilters}
          className="flex-1 py-2.5 border-1 border-red-900 rounded-full font-medium text-sm text-black font-serif bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          Clear Filters
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowFilters(false)}
          className="flex-1 py-2.5 bg-[#832729] text-white rounded-full font-medium text-sm hover:bg-[#6A1F21] transition-colors flex items-center justify-center gap-2"
        >
          Show Result ({sortedProducts.length.toLocaleString()})
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
    </div>
 
)}

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
    `}</style>
  </div>
  </>
);
};

export default ProductsListingPage;