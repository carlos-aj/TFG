// Utility functions for authentication

/**
 * Save authentication data to localStorage
 * @param {Object} data - Authentication data from server
 */
export const saveAuthData = (data) => {
  if (!data) return;
  
  try {
    // Store token properly
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    // Store user role
    if (data.rol) {
      localStorage.setItem('role', data.rol);
    }
    
    // Store user ID
    if (data.id) {
      localStorage.setItem('user_id', data.id.toString());
    }
    
    // Store user name
    if (data.nombre) {
      localStorage.setItem('nombre', data.nombre);
    }
    
    // Store user last name
    if (data.apellidos) {
      localStorage.setItem('apellidos', data.apellidos);
    }
    
    // Store email
    if (data.email) {
      localStorage.setItem('email', data.email);
    }
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error saving auth data:', error);
  }
};

/**
 * Get authentication token
 * @returns {string|null} - JWT token or null if not found
 */
export const getToken = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export const checkAuthenticated = () => {
  try {
    const token = getToken();
    return Boolean(token && token !== 'true' && token !== 'undefined' && token !== 'null');
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Get user role
 * @returns {string} - User role or empty string if not found
 */
export const getUserRole = () => {
  try {
    return localStorage.getItem('role') || '';
  } catch (error) {
    console.error('Error getting user role:', error);
    return '';
  }
};

/**
 * Clear authentication data
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('nombre');
    localStorage.removeItem('apellidos');
    localStorage.removeItem('email');
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

/**
 * Get authentication headers
 * @returns {Object} - Headers with Authorization token
 */
export const getAuthHeaders = () => {
  try {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return {};
  }
}; 