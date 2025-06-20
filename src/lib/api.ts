// Get the current host and use it for API calls
const getApiBaseUrl = () => {
  const host = window.location.hostname;
  const port = '8000';
  return `http://${host}:${port}/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();

// API çağrıları için temel fonksiyon
async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Token yönetimi için yardımcı fonksiyonlar
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    setAuthToken(data.access_token);
    return data;
  },
  
  logout: () => {
    removeAuthToken();
  },
  
  getMe: () => fetchAPI('/auth/me', {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  }),
};

// Categories API
export const categoriesAPI = {
  getAll: (activeOnly = true) => 
    fetchAPI(`/categories/?active_only=${activeOnly}`),
  
  getById: (id: number) => 
    fetchAPI(`/categories/${id}`),
  
  create: (data: any) => 
    fetchAPI('/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }),
  
  update: (id: number, data: any) => 
    fetchAPI(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }),
  
  delete: (id: number) => 
    fetchAPI(`/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }),
};

// Events API
export const eventsAPI = {
  getAll: (params?: {
    skip?: number;
    limit?: number;
    category_id?: number;
    active_only?: boolean;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    return fetchAPI(`/events/?${queryParams}`);
  },
  
  getFeatured: () => 
    fetchAPI('/events/featured'),
  
  getById: (id: number) => 
    fetchAPI(`/events/${id}`),
  
  create: (data: any) => 
    fetchAPI('/events/', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }),
  
  update: (id: number, data: any) => 
    fetchAPI(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }),
  
  delete: (id: number) => 
    fetchAPI(`/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }),
  
  uploadImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/events/${id}/upload-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Image upload failed');
    }
    
    return response.json();
  },
};

// Settings API
export const settingsAPI = {
  get: () => fetchAPI('/settings/'),
  
  update: (data: any) => 
    fetchAPI('/settings/', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }),
};

// Stories API
export const storiesAPI = {
  getAll: (activeOnly = true) => 
    fetchAPI(`/stories/?active_only=${activeOnly}`),
  
  getById: (id: number) => 
    fetchAPI(`/stories/${id}`),
  
  create: (data: any) => 
    fetchAPI('/stories/', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }),
  
  update: (id: number, data: any) => 
    fetchAPI(`/stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }),
  
  delete: (id: number) => 
    fetchAPI(`/stories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }),
  
  uploadImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/stories/${id}/upload-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Image upload failed');
    }
    
    return response.json();
  },
  
  cleanupExpired: () => 
    fetchAPI('/stories/expired/cleanup', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }),
};
