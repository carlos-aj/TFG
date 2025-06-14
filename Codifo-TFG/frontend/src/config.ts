const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_URL = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl; 