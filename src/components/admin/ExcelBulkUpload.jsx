import { useState, useEffect } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, Loader2, Download, X, Plus } from "lucide-react";
import * as XLSX from 'xlsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_ADMIN || 'http://localhost:8787/admin';
const getAuthToken = () => localStorage.getItem('adminToken');

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

const categoryAPI = {
  getAll: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return handleResponse(response);
  },
};

const subcategoryAPI = {
  getAll: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/subcategories`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return handleResponse(response);
  },
};

const productAPI = {
  getAll: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return handleResponse(response);
  },
  bulkCreate: async (products) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ products }),
    });
    return handleResponse(response);
  },
};

// Field mapping configuration - case insensitive
const FIELD_MAPPINGS = {
  // Required fields
  name: ['name', 'product_name', 'productname', 'title', 'product_title'],
  sku: ['sku', 'product_code', 'productcode', 'code'],
  categorySlug: ['category', 'categoryslug', 'category_slug', 'cat', 'cat_slug'],
  
  // Optional fields
  subCategorySlug: ['subcategory', 'subcategoryslug', 'subcategory_slug', 'subcat', 'sub_category'],
  
  // Pricing
  basePrice: ['price', 'baseprice', 'base_price', 'cost', 'amount'],
  discountedPrice: ['discount_price', 'discountedprice', 'sale_price', 'saleprice'],
  couponApplicable: ['coupon_applicable', 'couponapplicable', 'coupon'],
  
  // Necklace Layers (supports multiple columns like "1_layer_price", "2_layer_price")
  necklaceLayers: ['necklace_layers', 'layers', 'layer_pricing'],
  
  // Details
  metal: ['metal', 'metal_type'],
  metalPurity: ['metal_purity', 'metalpurity', 'purity'],
  stone: ['stone', 'gemstone', 'gem'],
  stoneType: ['stone_type', 'stonetype', 'gem_type'],
  weight: ['weight', 'total_weight', 'totalweight'],
  stoneWeight: ['stone_weight', 'stoneweight'],
  metalWeight: ['metal_weight', 'metalweight'],
  size: ['size'],
  color: ['color', 'colour'],
  clarity: ['clarity'],
  certification: ['certification', 'certificate', 'cert'],
  
  // Images (comma-separated URLs)
  images: ['images', 'image', 'image_urls', 'imageurls', 'photos'],
  
  // Tags (comma-separated)
  tags: ['tags', 'keywords', 'labels'],
  
  // Inventory
  stock: ['stock', 'quantity', 'qty', 'inventory'],
  inStock: ['in_stock', 'instock', 'available'],
  
  // Status
  isActive: ['is_active', 'isactive', 'active', 'status'],
};

// Normalize field name (case-insensitive matching)
const normalizeFieldName = (fieldName) => {
  const normalized = fieldName.toLowerCase().trim().replace(/\s+/g, '_');
  
  for (const [standardField, variations] of Object.entries(FIELD_MAPPINGS)) {
    if (variations.includes(normalized)) {
      return standardField;
    }
  }
  
  return null;
};

const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === 'yes' || lower === '1' || lower === 'active';
  }
  return Boolean(value);
};

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

const parseArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
};

export default function ExcelBulkUpload({ onClose, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [existingProducts, setExistingProducts] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsData, subcatsData, productsData] = await Promise.all([
        categoryAPI.getAll(),
        subcategoryAPI.getAll(),
        productAPI.getAll(),
      ]);
      setCategories(catsData);
      setSubcategories(subcatsData);
      setExistingProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data: ' + error.message);
    }
    setLoading(false);
  };

  const findCategorySlug = (categoryName) => {
    if (!categoryName) return null;
    const name = categoryName.toLowerCase().trim();
    const category = categories.find(c => 
      c.name.toLowerCase() === name || 
      c.slug.toLowerCase() === name
    );
    return category?.slug || null;
  };

  const findSubcategorySlug = (subcategoryName, categorySlug) => {
    if (!subcategoryName) return null;
    const name = subcategoryName.toLowerCase().trim();
    const subcategory = subcategories.find(s => 
      (s.name.toLowerCase() === name || s.slug.toLowerCase() === name) &&
      (!categorySlug || s.categorySlug === categorySlug)
    );
    return subcategory?.slug || null;
  };

  const parseNecklaceLayers = (row, normalizedFields) => {
    const layers = [];
    const layerOptions = ['1-layer', '2-layer', '3-layer', '4-layer', '5-layer'];
    
    // Check for individual layer price columns
    Object.keys(row).forEach(key => {
      const normalized = key.toLowerCase().replace(/\s+/g, '_');
      layerOptions.forEach(layerOption => {
        const layerNum = layerOption.split('-')[0];
        if (normalized.includes(layerNum) && (normalized.includes('layer') || normalized.includes('price'))) {
          const price = parseNumber(row[key]);
          if (price > 0) {
            layers.push({ layer: layerOption, price });
          }
        }
      });
    });
    
    return layers;
  };

  const validateAndParseExcel = async (fileData) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            reject(new Error('Excel file is empty'));
            return;
          }

          // Build set of existing SKUs from database
          const existingSKUSet = new Set(existingProducts.map(p => p.sku.toLowerCase()));
          
          // Track SKUs in current batch to detect within-file duplicates
          const batchSKUMap = new Map(); // Map SKU -> first row number

          const validProducts = [];
          const duplicateErrors = [];

          jsonData.forEach((row, index) => {
            const rowNumber = index + 2; // Excel row number (header is row 1)
            const errors = [];
            
            // Normalize all field names
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
              const normalizedKey = normalizeFieldName(key);
              if (normalizedKey) {
                normalizedRow[normalizedKey] = row[key];
              }
            });

            // Required fields validation
            const name = normalizedRow.name?.toString().trim();
            if (!name) {
              errors.push('Name is required');
            }

            const sku = normalizedRow.sku?.toString().trim();
            if (!sku) {
              errors.push('SKU is required');
            } else {
              const skuLower = sku.toLowerCase();
              
              // Check against existing products in database
              if (existingSKUSet.has(skuLower)) {
                errors.push(`SKU "${sku}" already exists in database`);
              }
              
              // Check against previous rows in this batch
              if (batchSKUMap.has(skuLower)) {
                errors.push(`SKU "${sku}" duplicated in Excel (first appeared in row ${batchSKUMap.get(skuLower)})`);
              } else {
                batchSKUMap.set(skuLower, rowNumber);
              }
            }

            const categoryInput = normalizedRow.categorySlug?.toString().trim();
            if (!categoryInput) {
              errors.push('Category is required');
            }

            const categorySlug = findCategorySlug(categoryInput);
            if (categoryInput && !categorySlug) {
              errors.push(`Category '${categoryInput}' not found`);
            }

            // Optional subcategory validation
            let subCategorySlug = '';
            const subcategoryInput = normalizedRow.subCategorySlug?.toString().trim();
            if (subcategoryInput) {
              subCategorySlug = findSubcategorySlug(subcategoryInput, categorySlug);
              if (!subCategorySlug) {
                errors.push(`Subcategory '${subcategoryInput}' not found or doesn't belong to the category`);
              }
            }

            if (errors.length > 0) {
              duplicateErrors.push({
                row: rowNumber,
                productName: name || 'Unknown',
                sku: sku || 'N/A',
                errors: errors
              });
            } else {
              // Parse necklace layers
              const necklaceLayers = parseNecklaceLayers(row, normalizedRow);

              // Build product object
              const product = {
                name: name,
                slug: generateSlug(name),
                sku: sku,
                categorySlug: categorySlug,
                subCategorySlug: subCategorySlug,
                pricing: {
                  basePrice: parseNumber(normalizedRow.basePrice),
                  discountedPrice: parseNumber(normalizedRow.discountedPrice),
                  couponApplicable: parseBoolean(normalizedRow.couponApplicable),
                  couponList: [],
                },
                necklaceLayers: necklaceLayers,
                details: {
                  metal: normalizedRow.metal?.toString() || '',
                  metalPurity: normalizedRow.metalPurity?.toString() || '',
                  stone: normalizedRow.stone?.toString() || '',
                  stoneType: normalizedRow.stoneType?.toString() || '',
                  weight: parseNumber(normalizedRow.weight),
                  stoneWeight: parseNumber(normalizedRow.stoneWeight),
                  metalWeight: parseNumber(normalizedRow.metalWeight),
                  size: normalizedRow.size?.toString() || '',
                  color: normalizedRow.color?.toString() || '',
                  clarity: normalizedRow.clarity?.toString() || '',
                  certification: normalizedRow.certification?.toString() || '',
                },
                images: parseArray(normalizedRow.images),
                tags: parseArray(normalizedRow.tags),
                inventory: {
                  stock: parseNumber(normalizedRow.stock),
                  inStock: parseBoolean(normalizedRow.inStock ?? true),
                },
                isActive: parseBoolean(normalizedRow.isActive ?? true),
              };

              validProducts.push(product);
            }
          });

          resolve({
            validProducts,
            duplicateErrors,
            totalRows: jsonData.length
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(fileData);
    });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setFile(selectedFile);
    setValidationResults(null);
    setUploadResults(null);
    
    setLoading(true);
    try {
      const results = await validateAndParseExcel(selectedFile);
      setValidationResults(results);
      
      // Auto-upload valid products if there are any
      if (results.validProducts.length > 0) {
        await handleAutoUpload(results.validProducts);
      }
    } catch (error) {
      alert('Error parsing Excel file: ' + error.message);
      setFile(null);
    }
    setLoading(false);
  };

  const handleAutoUpload = async (products) => {
    setUploading(true);
    try {
      const result = await productAPI.bulkCreate(products);
      setUploadResults(result);
      
      if (result.successCount > 0) {
        // Refresh the existing products list
        const updatedProducts = await productAPI.getAll();
        setExistingProducts(updatedProducts);
      }
    } catch (error) {
      console.error('Error uploading products:', error);
      setUploadResults({
        successCount: 0,
        failedCount: products.length,
        errors: [{ error: error.message }],
        createdProducts: []
      });
    }
    setUploading(false);
  };

  const handleDone = () => {
    if (uploadResults && uploadResults.successCount > 0) {
      if (onSuccess) {
        onSuccess();
      }
    }
    onClose();
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Sample Gold Necklace',
        sku: 'GN-001',
        category: 'necklaces',
        subcategory: 'gold-necklaces',
        price: 50000,
        discount_price: 45000,
        coupon_applicable: 'yes',
        '1_layer_price': 45000,
        '2_layer_price': 85000,
        '3_layer_price': 120000,
        metal: 'Gold',
        metal_purity: '22K',
        stone: 'Diamond',
        stone_type: 'Natural',
        weight: 25.5,
        stone_weight: 2.5,
        metal_weight: 23,
        size: 'Medium',
        color: 'Yellow Gold',
        clarity: 'VS1',
        certification: 'IGI',
        images: 'https://example.com/image1.jpg,https://example.com/image2.jpg',
        tags: 'wedding,luxury,bridal',
        stock: 10,
        in_stock: 'yes',
        is_active: 'yes'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'product_upload_template.xlsx');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700">
        <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Bulk Product Upload</h2>
              <p className="text-blue-100 text-sm">Upload multiple products via Excel</p>
            </div>
          </div>
          <button
            onClick={handleDone}
            className="hover:bg-blue-700 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Download Template */}
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Need a template?</h3>
                <p className="text-slate-400 text-sm">Download our Excel template with sample data</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Upload Excel File
            </label>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="excel-upload"
                disabled={loading || uploading}
              />
              <label
                htmlFor="excel-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-slate-400 mb-3" />
                <span className="text-white font-medium mb-1">
                  {file ? file.name : 'Click to upload Excel file'}
                </span>
                <span className="text-slate-400 text-sm">
                  Supports .xlsx and .xls files
                </span>
              </label>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-white">Processing Excel file...</span>
            </div>
          )}

          {/* Upload in Progress */}
          {uploading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              <span className="ml-3 text-white">Uploading products...</span>
            </div>
          )}

          {/* Upload Results */}
          {uploadResults && !uploading && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4">
                  <div className="text-green-400 text-sm font-medium mb-1">✓ Uploaded Successfully</div>
                  <div className="text-2xl font-bold text-white">{uploadResults.successCount}</div>
                </div>
                <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4">
                  <div className="text-red-400 text-sm font-medium mb-1">✗ Failed</div>
                  <div className="text-2xl font-bold text-white">{uploadResults.failedCount}</div>
                </div>
              </div>

              {/* Success Message */}
              {uploadResults.successCount > 0 && (
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Products Uploaded Successfully
                  </h3>
                  <p className="text-green-300 text-sm">
                    {uploadResults.successCount} product(s) have been added to your inventory.
                  </p>
                </div>
              )}

              {/* Backend Errors (if any) */}
              {uploadResults.errors && uploadResults.errors.length > 0 && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Upload Errors
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {uploadResults.errors.map((error, index) => (
                      <div key={index} className="bg-red-900/30 rounded p-3 text-sm">
                        <div className="text-red-300 font-medium">
                          {error.product || 'Unknown Product'}
                        </div>
                        <div className="text-red-400">{error.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Validation Results - Duplicate Errors Only */}
          {validationResults && !uploading && validationResults.duplicateErrors.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                ⚠️ Duplicate SKUs Detected - {validationResults.duplicateErrors.length} Row(s) Skipped
              </h3>
              <p className="text-yellow-300 text-sm mb-3">
                The following products were skipped due to duplicate SKUs. Only unique SKUs were uploaded.
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {validationResults.duplicateErrors.map((error, index) => (
                  <div key={index} className="bg-yellow-900/30 rounded p-3">
                    <div className="text-yellow-300 font-medium mb-1">
                      Row {error.row}: {error.productName}
                    </div>
                    <div className="text-yellow-400 text-sm mb-2">
                      <strong>SKU:</strong> {error.sku}
                    </div>
                    <ul className="list-disc list-inside text-yellow-400 text-sm space-y-1">
                      {error.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Info */}
          {validationResults && !loading && (
            <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-slate-400 text-sm mb-1">Total Rows</div>
                  <div className="text-xl font-bold text-white">{validationResults.totalRows}</div>
                </div>
                <div>
                  <div className="text-green-400 text-sm mb-1">Valid & Uploaded</div>
                  <div className="text-xl font-bold text-white">{validationResults.validProducts.length}</div>
                </div>
                <div>
                  <div className="text-yellow-400 text-sm mb-1">Duplicates Skipped</div>
                  <div className="text-xl font-bold text-white">{validationResults.duplicateErrors.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* Done Button */}
          {uploadResults && (
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={handleDone}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}