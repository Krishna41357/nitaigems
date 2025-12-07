import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    // Check for user auth (regular users)
    const userToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    // Check for admin auth (admin users)
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminUser');
    
    // Prioritize admin auth if available
    if (adminToken && adminData) {
      try {
        const parsedUser = JSON.parse(adminData);
        if (parsedUser.isAdmin) {
          setUser(parsedUser);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
        logout();
      }
    } 
    // Otherwise check for regular user auth
    else if (userToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    
    setLoading(false);
  };

  const login = (token, userData) => {
    // Store based on user type
    if (userData.isAdmin) {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(userData));
    } else {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setUser(userData);
  };

  const logout = () => {
  // Check user type BEFORE clearing data
  const isAdminUser = user?.isAdmin;
  
  // Clear both user and admin tokens
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  setUser(null);
  
  // Return user type so component can handle navigation
  return isAdminUser;
};

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};