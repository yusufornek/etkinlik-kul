// Get the current host and use it for API calls
const getApiBaseUrl = () => {
  const host = window.location.hostname;
  // Assuming backend runs on port 8000 for local dev
  const port = host === 'localhost' || host.startsWith('127.0.0.1') ? '8000' : window.location.port;
  // Adjust protocol if served over https, though unlikely for local dev with different ports
  const protocol = window.location.protocol;
  return `${protocol}//${host}:${port}/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();

// --- Existing fetchAPI (can be kept for old parts or refactored) ---
async function fetchAPI_legacy(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text(); // Try to get more info
    console.error("API Error Response:", errorBody);
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  return response.json();
}

// --- New fetchApi for Club Management System features ---
interface FetchApiOptions extends RequestInit {
  token?: string;
  body?: any;
  expectJson?: boolean;
  mockUserEmail?: string; // For X-User-Email header based mock auth
}

async function fetchApi<T = any>(endpoint: string, options: FetchApiOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const { method = 'GET', token, body, expectJson = true, mockUserEmail, ...restOptions } = options;

  const headers: HeadersInit = {
    ...(body && typeof body !== 'undefined' ? { 'Content-Type': 'application/json' } : {}),
    ...restOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Add X-User-Email header if mockUserEmail is provided (for mock backend auth)
  // In a real app, the token would be decoded by the backend to get the user.
  // This mockUserEmail simulates that for now.
  if (mockUserEmail) {
    headers['X-User-Email'] = mockUserEmail;
  }


  const config: RequestInit = {
    method,
    headers,
    ...restOptions,
  };

  if (body && typeof body !== 'undefined') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = await response.text();
    }
    console.error('API Error:', response.status, errorData);
    throw new Error(`API request failed: ${response.status} - ${JSON.stringify(errorData) || response.statusText}`);
  }

  if (!expectJson) {
    return undefined as T; // For DELETE requests or similar that don't return JSON body
  }

  // Handle cases where response might be empty but still OK (e.g., 204 No Content)
  const contentType = response.headers.get("content-type");
  if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
    return {} as T; // Or handle as appropriate, maybe null or a specific type
  }

  return response.json() as Promise<T>;
}


// Token yönetimi için yardımcı fonksiyonlar (existing)
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

// Auth API (existing, uses legacy fetchAPI_legacy or direct fetch)
export const authAPI = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, { // Direct fetch
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
  
  getMe: () => fetchAPI_legacy('/auth/me', { // Uses legacy fetchAPI_legacy
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  }),
};

// Categories API (existing, uses legacy fetchAPI_legacy)
export const categoriesAPI = {
  getAll: (activeOnly = true) => 
    fetchAPI_legacy(`/categories/?active_only=${activeOnly}`),
  getById: (id: number) => fetchAPI_legacy(`/categories/${id}`),
  create: (data: any) => fetchAPI_legacy('/categories/', {method: 'POST', body: JSON.stringify(data), headers: {'Authorization': `Bearer ${getAuthToken()}`}}),
  update: (id: number, data: any) => fetchAPI_legacy(`/categories/${id}`, {method: 'PUT', body: JSON.stringify(data), headers: {'Authorization': `Bearer ${getAuthToken()}`}}),
  delete: (id: number) => fetchAPI_legacy(`/categories/${id}`, {method: 'DELETE', headers: {'Authorization': `Bearer ${getAuthToken()}`}}),
};

// Events API (existing, uses legacy fetchAPI_legacy or direct fetch)
export const eventsAPI = {
  getAll: (params?: { skip?: number; limit?: number; category_id?: number; active_only?: boolean; search?: string; }) => {
    const queryParams = new URLSearchParams(); if (params) { Object.entries(params).forEach(([key, value]) => { if (value !== undefined) { queryParams.append(key, String(value)); } }); }
    return fetchAPI_legacy(`/events/?${queryParams}`);
  },
  getFeatured: () => fetchAPI_legacy('/events/featured'),
  getById: (id: number) => fetchAPI_legacy(`/events/${id}`),
  create: (data: any) => fetchAPI_legacy('/events/', {method: 'POST', body: JSON.stringify(data), headers: {'Authorization': `Bearer ${getAuthToken()}`}}),
  update: (id: number, data: any) => fetchAPI_legacy(`/events/${id}`, {method: 'PUT', body: JSON.stringify(data), headers: {'Authorization': `Bearer ${getAuthToken()}`}}),
  delete: (id: number) => fetchAPI_legacy(`/events/${id}`, {method: 'DELETE', headers: {'Authorization': `Bearer ${getAuthToken()}`}}),
  uploadImage: async (id: number, file: File) => {
    const formData = new FormData(); formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/events/${id}/upload-image`, {method: 'POST', body: formData, headers: {'Authorization': `Bearer ${getAuthToken()}`}});
    if (!response.ok) { throw new Error('Image upload failed'); } return response.json();
  },
};

// Settings API (existing, uses legacy fetchAPI_legacy)
export const settingsAPI = {
  get: () => fetchAPI_legacy('/settings/'),
  update: (data: any) => fetchAPI_legacy('/settings/', {method: 'PUT', body: JSON.stringify(data), headers: {'Authorization': `Bearer ${getAuthToken()}`}}),
};

// Stories API (existing, uses legacy fetchAPI_legacy or direct fetch)
export const storiesAPI = {
  getAll: (activeOnly = true) => fetchAPI_legacy(`/stories/?active_only=${activeOnly}`),
  getById: (id: number) => fetchAPI_legacy(`/stories/${id}`),
  create: (data: any) => fetchAPI_legacy('/stories/', {method: 'POST', body: JSON.stringify(data), headers: {'Authorization': `Bearer ${getAuthToken()}`}}),
  update: (id: number, data: any) => fetchAPI_legacy(`/stories/${id}`, {method: 'PUT', body: JSON.stringify(data), headers: {'Authorization': `Bearer ${getAuthToken()}`}}),
  delete: (id: number) => fetchAPI_legacy(`/stories/${id}`, {method: 'DELETE', headers: {'Authorization': `Bearer ${getAuthToken()}`}}),
  uploadImage: async (id: number, file: File) => {
    const formData = new FormData(); formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/stories/${id}/upload-image`, {method: 'POST', body: formData, headers: {'Authorization': `Bearer ${getAuthToken()}`}});
    if (!response.ok) { throw new Error('Image upload failed'); } return response.json();
  },
  cleanupExpired: () => fetchAPI_legacy('/stories/expired/cleanup', {method: 'DELETE', headers: {'Authorization': `Bearer ${getAuthToken()}`}}),
};


// --- New Type Definitions (mirroring backend schemas) ---
export interface Club {
  id: number;
  name: string;
  description?: string | null;
  logo?: string | null;
  contact_info?: string | null;
  is_active: boolean;
  created_at: string; // Assuming ISO string date
  updated_at?: string | null;
}

// Basic User type if not already defined elsewhere
// Ensure this is compatible with how User might be used if UserRead from backend is more complex
export interface User {
  id: number;
  email: string;
  full_name?: string | null;
  student_id?: string | null; // Added based on backend User model
  is_active?: boolean; // Added based on backend User model
  roles?: UserRole[]; // Added based on backend User model and deps.py mock
}

export interface ClubMember {
  id: number;
  club_id: number;
  user_id: number;
  role: string; // e.g., "member", "officer", "president"
  joined_at: string;
  user?: User;
}

export enum RoleType {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  CLUB_MANAGER = "club_manager",
  USER = "user",
}

export interface UserRole {
  id: number;
  user_id: number;
  role_type: RoleType;
  club_id?: number | null;
  granted_at: string;
}

export interface ContentRequest {
  id: number;
  club_id: number;
  event_data: any;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at?: string | null;
  reviewer_id?: number | null;
  club?: Club | null;
  reviewer?: User | null;
}

export interface ContentRequestCreate {
  club_id: number;
  event_data: any;
  status?: "pending" | "approved" | "rejected"; // Default is pending on backend
}

export interface ClubMemberCreate {
  user_id: number;
  role: string; // e.g., "member", "officer", "president"
}

// --- New API Functions ---
// The 'token' argument in these functions will be the actual JWT for real auth.
// For mock auth, we'll also need a way to pass the X-User-Email.
// Modifying functions to accept mockUserEmail, or have fetchApi derive it from a global context.
// For simplicity, let's assume mockUserEmail is passed to fetchApi if needed,
// or that the real token will eventually make it unnecessary.
// The provided functions use 'token' which implies real auth token.
// The X-User-Email logic is inside fetchApi.

// Clubs
// For mock auth, ensure 'mockUserEmail' is passed to fetchApi if 'token' isn't a real JWT
// e.g. fetchApi('/clubs', { token, mockUserEmail: "admin@example.com" });
// This detail depends on how the app manages current user context.

export async function getClubs(token?: string, mockUserEmail?: string): Promise<Club[]> {
  return fetchApi('/clubs', { token, mockUserEmail });
}

export async function getClubById(id: number, token?: string, mockUserEmail?: string): Promise<Club> {
  return fetchApi(`/clubs/${id}`, { token, mockUserEmail });
}

// Omit: Utility type to exclude properties from a type.
// Here, it's used because id, created_at, updated_at are typically managed by the backend.
export type ClubCreationData = Omit<Club, 'id' | 'created_at' | 'updated_at' | 'is_active'> & { is_active?: boolean };
export async function createClub(clubData: ClubCreationData, mockUserEmail: string): Promise<Club> {
  return fetchApi('/clubs', { method: 'POST', mockUserEmail, body: clubData });
}

export type ClubUpdateData = Partial<Omit<Club, 'id' | 'created_at' | 'updated_at'>>;
export async function updateClub(id: number, clubData: ClubUpdateData, mockUserEmail: string): Promise<Club> {
  return fetchApi(`/clubs/${id}`, { method: 'PUT', mockUserEmail, body: clubData });
}

export async function deleteClub(id: number, mockUserEmail: string): Promise<void> {
  return fetchApi(`/clubs/${id}`, { method: 'DELETE', mockUserEmail, expectJson: false });
}

// Club Members
export async function getClubMembers(clubId: number, token?: string, mockUserEmail?: string): Promise<ClubMember[]> {
  return fetchApi(`/clubs/${clubId}/members`, { token, mockUserEmail });
}

export async function addClubMember(clubId: number, memberData: ClubMemberCreate, mockUserEmail: string): Promise<ClubMember> {
  return fetchApi(`/clubs/${clubId}/members`, { method: 'POST', mockUserEmail, body: memberData });
}

export async function removeClubMember(clubId: number, userId: number, mockUserEmail: string): Promise<void> {
  return fetchApi(`/clubs/${clubId}/members/${userId}`, { method: 'DELETE', mockUserEmail, expectJson: false });
}

// User Roles
// Note: UserRoleCreate schema might be slightly different from backend (e.g. role_in in backend)
// For assignSystemRole, backend UserRoleCreate schema has {user_id, role_type, club_id?}
// For assignClubManagerRole, backend UserRoleCreate schema has {user_id, role_type, club_id}
export interface UserRoleAssignPayload {
    user_id: number;
    role_type: RoleType;
    club_id?: number | null;
}

export async function assignSystemRole(roleData: UserRoleAssignPayload, mockUserEmail: string): Promise<UserRole> {
  if (roleData.role_type !== RoleType.ADMIN && roleData.role_type !== RoleType.SUPER_ADMIN) {
    throw new Error("assignSystemRole called with invalid role_type. Must be ADMIN or SUPER_ADMIN.");
  }
  // Ensure club_id is null or undefined for system roles, matching backend validation.
  const payload = { ...roleData, club_id: null };
  return fetchApi('/user-roles/system', { method: 'POST', mockUserEmail, body: payload });
}

export async function assignClubManagerRole(roleData: { user_id: number; club_id: number }, mockUserEmail: string): Promise<UserRole> {
  const payload: UserRoleAssignPayload = {
    user_id: roleData.user_id,
    role_type: RoleType.CLUB_MANAGER, // role_type is fixed for this function
    club_id: roleData.club_id
  };
  return fetchApi('/user-roles/club', { method: 'POST', mockUserEmail, body: payload });
}

export async function getUserRoles(userId: number, token?: string, mockUserEmail?: string): Promise<UserRole[]> {
  return fetchApi(`/user-roles/user/${userId}`, { token, mockUserEmail });
}

export async function removeUserRole(roleId: number, token?: string, mockUserEmail?: string): Promise<void> {
  return fetchApi(`/user-roles/${roleId}`, { method: 'DELETE', mockUserEmail, expectJson: false });
}

// Content Requests
export async function createContentRequest(requestData: ContentRequestCreate, mockUserEmail: string): Promise<ContentRequest> {
  return fetchApi('/content-requests', { method: 'POST', mockUserEmail, body: requestData });
}

export async function getPendingContentRequests(token?: string, mockUserEmail?: string): Promise<ContentRequest[]> {
  return fetchApi('/content-requests/pending', { token, mockUserEmail });
}

export async function approveContentRequest(requestId: number, token?: string, mockUserEmail?: string): Promise<ContentRequest> {
  return fetchApi(`/content-requests/${requestId}/approve`, { method: 'PUT', token, mockUserEmail });
}

export async function rejectContentRequest(requestId: number, token?: string, mockUserEmail?: string): Promise<ContentRequest> {
  return fetchApi(`/content-requests/${requestId}/reject`, { method: 'PUT', token, mockUserEmail });
}

export async function getClubContentRequests(clubId: number, token?: string, mockUserEmail?: string): Promise<ContentRequest[]> {
  return fetchApi(`/content-requests/club/${clubId}`, { token, mockUserEmail });
}

// For functions that create/modify data, mockUserEmail is typically required for auth.
// The `token` parameter is kept for eventual transition to real JWT auth.
// If `token` is present, `fetchApi` will use it for Authorization header.
// If `mockUserEmail` is present, `fetchApi` will use it for X-User-Email header.
// Both can be present if needed during transition or complex mock scenarios.
