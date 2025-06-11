// Utility functions for authentication

/**
 * Save authentication data to localStorage
 * @param {Object} data - Authentication data from server
 */
export const saveAuthData = (data) => {
  if (!data) return;
  
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
};

/**
 * Get authentication token
 * @returns {string|null} - JWT token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export const checkAuthenticated = () => {
  const token = getToken();
  return !!token && token !== 'true' && token !== 'undefined' && token !== 'null';
};

/**
 * Get user role
 * @returns {string} - User role or empty string if not found
 */
export const getUserRole = () => {
  return localStorage.getItem('role') || '';
};

/**
 * Clear authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user_id');
  localStorage.removeItem('nombre');
  localStorage.removeItem('apellidos');
  localStorage.removeItem('email');
  
  // Dispatch storage event to notify other components
  window.dispatchEvent(new Event('storage'));
};

/**
 * Get authentication headers
 * @returns {Object} - Headers with Authorization token
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}; 