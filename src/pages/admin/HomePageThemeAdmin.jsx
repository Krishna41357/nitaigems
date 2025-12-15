import React, { useState, useEffect } from 'react';
import { Palette, Save, RotateCcw, Eye, Loader2 } from 'lucide-react';

const HomePageThemeAdmin = () => {
  const [theme, setTheme] = useState({
    heroBg: '#FFFFFF',
    categoriesBg: '#F9FAFB',
    subcategoriesBg: '#FFFFFF',
    collectionsBg: '#F9FAFB',
    reelsBg: '#FFFFFF',
    trustBadgesBg: '#F9FAFB',
    reviewsBg: '#FFFFFF',
    footerBg: '#1F2937',
  });

  const [originalTheme, setOriginalTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasChanges, setHasChanges] = useState(false);

  const sections = [
    { key: 'heroBg', label: 'Hero Carousel', description: 'Banner carousel section' },
    { key: 'categoriesBg', label: 'Jewellery Categories', description: 'Main categories grid' },
    { key: 'subcategoriesBg', label: 'Subcategories Showcase', description: 'Subcategories section' },
    { key: 'collectionsBg', label: 'Collections', description: 'Featured collections' },
    { key: 'reelsBg', label: 'Reels Section', description: 'Video reels showcase' },
    { key: 'trustBadgesBg', label: 'Trust Badges', description: 'Assurance section' },
    { key: 'reviewsBg', label: 'Customer Reviews', description: 'Reviews carousel' },
    { key: 'footerBg', label: 'Footer', description: 'Footer section' },
  ];

  useEffect(() => {
    fetchTheme();
  }, []);

  useEffect(() => {
    if (originalTheme) {
      const changed = JSON.stringify(theme) !== JSON.stringify(originalTheme);
      setHasChanges(changed);
    }
  }, [theme, originalTheme]);

  const fetchTheme = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/homepage-theme`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTheme(data);
        setOriginalTheme(data);
      } else {
        showMessage('error', 'Failed to fetch theme');
      }
    } catch (error) {
      console.error('Error fetching theme:', error);
      showMessage('error', 'Error loading theme settings');
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (key, value) => {
    setTheme(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      console.log('[THEME_ADMIN] Saving theme:', theme);
      
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/admin/homepage-theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(theme)
      });
      
      console.log('[THEME_ADMIN] Response status:', response.status);

      if (response.ok) {
        setOriginalTheme(theme);
        showMessage('success', 'Theme updated successfully! Changes will appear on the homepage.');
        setHasChanges(false);
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to update theme');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      showMessage('error', 'Error saving theme settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalTheme) {
      setTheme(originalTheme);
      showMessage('info', 'Changes reset to last saved state');
    }
  };

  const handleResetToDefaults = () => {
    const defaults = {
      heroBg: '#FFFFFF',
      categoriesBg: '#F9FAFB',
      subcategoriesBg: '#FFFFFF',
      collectionsBg: '#F9FAFB',
      reelsBg: '#FFFFFF',
      trustBadgesBg: '#F9FAFB',
      reviewsBg: '#FFFFFF',
      footerBg: '#1F2937',
    };
    setTheme(defaults);
    showMessage('info', 'Reset to default colors');
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const getColorName = (hex) => {
    const colors = {
      '#FFFFFF': 'White',
      '#F9FAFB': 'Gray 50',
      '#F3F4F6': 'Gray 100',
      '#E5E7EB': 'Gray 200',
      '#1F2937': 'Gray 800',
      '#111827': 'Gray 900',
      '#FEF3C7': 'Amber 100',
      '#FDE68A': 'Amber 200',
    };
    return colors[hex.toUpperCase()] || hex;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading theme settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Palette className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Homepage Theme Settings</h1>
                <p className="text-sm text-gray-600">Customize background colors for each section</p>
              </div>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview Homepage
            </a>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Color Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {sections.map((section) => (
            <div key={section.key} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {section.label}
                  </h3>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
                <div 
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm flex-shrink-0 ml-4"
                  style={{ backgroundColor: theme[section.key] }}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme[section.key]}
                    onChange={(e) => handleColorChange(section.key, e.target.value)}
                    className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme[section.key]}
                    onChange={(e) => handleColorChange(section.key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="#FFFFFF"
                    maxLength={7}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Color: {getColorName(theme[section.key])}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetToDefaults}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Discard Changes
                </button>
              )}
            </div>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                hasChanges && !saving
                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
          
          {hasChanges && (
            <p className="text-sm text-amber-600 mt-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></span>
              You have unsaved changes
            </p>
          )}
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Preview</h3>
          <div className="space-y-3">
            {sections.map((section) => (
              <div 
                key={section.key}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200"
                style={{ backgroundColor: theme[section.key] }}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{section.label}</p>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
                <div className="text-xs font-mono text-gray-600 bg-white/80 px-3 py-1 rounded">
                  {theme[section.key]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageThemeAdmin;