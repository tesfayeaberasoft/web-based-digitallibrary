const configuredApiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, '');

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
