import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider, WishlistProvider } from "./contexts/CartContext";
import { AdminLayout } from "./components/layout/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import UserLoginModal from "./pages/UserLogin";
import CartPage from "./pages/CartPage";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Products from "./pages/admin/Products";
import Events from "./pages/admin/Events";
import Coupons from "./pages/admin/Coupons";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import ProductsListingPage from "./pages/ProductsListingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentCallbackPage from "./pages/PaymentCallbackPage";
import CollectionsTab from "./pages/admin/CollectionsTab";
import OrdersPage from "./pages/OrdersPage";
import MobileBottomNav from "./components/MobileBottomNav";
import WhatsAppWidget from "./components/WhatsappWidget";
import ManageMedia from "./pages/admin/ManageMedia";
import HomePageThemeAdmin from "./pages/admin/HomePageThemeAdmin";
import ReelsPage from "./pages/ReelsPage";
import CategoriesAdmin from "./pages/admin/CategoriesAdmin";
import CategoriesPage from "./pages/CategoriesPage";
import PoliciesPage from "./components/homepage/PoliciesPage";

const queryClient = new QueryClient();

const AdminGuard = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated && user?.isAdmin
    ? children
    : <Navigate to="/admin/login" replace />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  
                  {/* REELS PAGE - Full page Instagram-style reels viewer */}
                  <Route path="/reels" element={<ReelsPage />} />
                  
                  {/* PRODUCT LISTING ROUTES - Uses /products/ (plural) */}
                  <Route path="/products" element={<ProductsListingPage />} />
                  <Route path="/products/collection/:collectionSlug" element={<ProductsListingPage />} />
                  <Route path="/products/category/:categorySlug" element={<ProductsListingPage />} />
                  <Route path="/products/category/:categorySlug/:subCategorySlug" element={<ProductsListingPage />} />
                  
                  {/* PRODUCT DETAIL ROUTES - Uses /product/ (singular) 
                      ALL variations lead to ProductDetailPage */}
                  <Route path="/product/category/:categorySlug/:subCategorySlug/:sku" element={<ProductDetailPage />} />
                  <Route path="/product/category/:categorySlug/:sku" element={<ProductDetailPage />} />
                  <Route path="/product/collection/:collectionSlug/:sku" element={<ProductDetailPage />} />
                  <Route path="/product/subcategory/:subCategorySlug/:sku" element={<ProductDetailPage />} />
                  <Route path="/product/:sku" element={<ProductDetailPage />} />

                  <Route path="/categories" element={<CategoriesPage />} />
                  
                  {/* Cart and Checkout */}
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/payment/callback" element={<PaymentCallbackPage />} />

                  {/* Policy Pages - Required for PhonePe Gateway */}
                  <Route path="/terms_and_conditions" element={<PoliciesPage defaultTab="terms" />} />
                  <Route path="/privacy_policy" element={<PoliciesPage defaultTab="privacy" />} />
                  <Route path="/shipping_policy" element={<PoliciesPage defaultTab="shipping" />} />
                  <Route path="/return_policy" element={<PoliciesPage defaultTab="terms" />} />
                  <Route path="/refund_policy" element={<PoliciesPage defaultTab="terms" />} />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/*" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                    <Route index element={<Dashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="products" element={<Products />} />
                    <Route path="events" element={<Events />} />
                    <Route path="coupons" element={<Coupons />} />
                    <Route path="collections" element={<CollectionsTab />} />
                    <Route path="media" element={<ManageMedia/>}/>
                    <Route path="background" element={<HomePageThemeAdmin/>} />
                    <Route path="categories" element={<CategoriesAdmin/>} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}