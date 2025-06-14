export const saveAuthData = (data) => {
  if (!data) return;
  
  try {
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    if (data.rol) {
      localStorage.setItem('role', data.rol);
    }
    
    if (data.id) {
      localStorage.setItem('user_id', data.id.toString());
    }
    
    if (data.nombre) {
      localStorage.setItem('nombre', data.nombre);
    }
    
    if (data.apellidos) {
      localStorage.setItem('apellidos', data.apellidos);
    }
    
    if (data.email) {
      localStorage.setItem('email', data.email);
    }
    
    if (data.barbero_id) {
      localStorage.setItem('barbero_id', data.barbero_id.toString());
    } else if (data.rol === 'empleado') {
      localStorage.setItem('barbero_id', '0');
    }
    
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error saving auth data:', error);
  }
};

export const getToken = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const checkAuthenticated = () => {
  try {
    const token = getToken();
    return Boolean(token && token !== 'true' && token !== 'undefined' && token !== 'null');
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const getUserRole = () => {
  try {
    return localStorage.getItem('role') || '';
  } catch (error) {
    console.error('Error getting user role:', error);
    return '';
  }
};

export const clearAuthData = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('nombre');
    localStorage.removeItem('apellidos');
    localStorage.removeItem('email');
    
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