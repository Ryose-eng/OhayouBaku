const API_URL = import.meta.env.VITE_API_URL;

export const apiClient = {
  get: async (endpoint, token = null) => {
    const headers = {
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api${endpoint}`, {
      headers,
      credentials: 'include'
    });
    
    return response;
  },

  post: async (endpoint, data, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    return response;
  }
}; 