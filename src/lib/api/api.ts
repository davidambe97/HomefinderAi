/**
 * API service functions for HomeFinder AI SaaS
 */

// API Base URL from environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

console.log('[API] Using API Base URL:', API_BASE_URL);

// Types matching backend
export interface PropertyListing {
  id: string;
  title: string;
  price: number;
  location: string;
  city: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  propertyType: string;
  images: string[];
  description?: string;
  features?: string[];
  yearBuilt?: number;
  lotSize?: number;
  source: string;
  listingDate?: string;
  url: string;
}

export interface SearchQuery {
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Client types
export interface Client {
  id: string;
  name: string;
  email: string;
  searchCriteria: SearchQuery;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddClientRequest {
  name: string;
  email: string;
  searchCriteria: SearchQuery;
}

export interface UpdateClientRequest {
  name?: string;
  email?: string;
  searchCriteria?: SearchQuery;
}

// Dashboard types
export interface DashboardResult {
  clientId: string;
  clientName: string;
  clientEmail: string;
  listings: PropertyListing[];
  totalListings: number;
  searchCriteria: SearchQuery;
  error?: string;
}

export interface DashboardResponse {
  agentId: string;
  agentName: string;
  totalClients: number;
  totalListings: number;
  results: DashboardResult[];
}

// Alert types
export interface Alert {
  clientId: string;
  clientName: string;
  newListings: PropertyListing[];
  timestamp: string;
  totalNew: number;
}

export interface AlertsResponse {
  totalAlerts: number;
  totalNewListings: number;
  alerts: Alert[];
}

/**
 * Get JWT token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Set JWT token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Use full URL with API_BASE_URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  console.log(`[API] ${options.method || 'GET'} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    console.error(`[API] Error ${response.status}:`, error);
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ==================== Auth API ====================

export async function login(data: LoginRequest): Promise<AuthResponse> {
  console.log('[API] Login request:', data.email);
  const response = await apiRequest<AuthResponse>('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (response.token) {
    setToken(response.token);
    console.log('[API] Login successful, token stored');
  }
  
  return response;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  console.log('[API] Register request:', data.email);
  const response = await apiRequest<AuthResponse>('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (response.token) {
    setToken(response.token);
    console.log('[API] Registration successful, token stored');
  }
  
  return response;
}

export function logout(): void {
  removeToken();
  console.log('[API] Logged out, token removed');
}

// ==================== Clients API ====================

export async function getClients(): Promise<Client[]> {
  console.log('[API] Fetching clients');
  const response = await apiRequest<{ clients: Client[] }>('/api/clients');
  console.log('[API] Clients fetched:', response.clients?.length || 0);
  return response.clients || [];
}

export async function addClient(data: AddClientRequest): Promise<Client> {
  console.log('[API] Adding client:', data.name);
  const response = await apiRequest<Client>('/api/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  console.log('[API] Client added:', response.id);
  return response;
}

export async function updateClient(id: string, data: UpdateClientRequest): Promise<Client> {
  console.log('[API] Updating client:', id);
  const response = await apiRequest<Client>(`/api/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  console.log('[API] Client updated:', response.id);
  return response;
}

export async function deleteClient(id: string): Promise<void> {
  console.log('[API] Deleting client:', id);
  await apiRequest(`/api/clients/${id}`, {
    method: 'DELETE',
  });
  console.log('[API] Client deleted:', id);
}

// ==================== Dashboard API ====================

export async function getDashboard(): Promise<DashboardResponse> {
  console.log('[API] Fetching dashboard');
  const response = await apiRequest<DashboardResponse>('/api/dashboard');
  console.log('[API] Dashboard fetched:', {
    totalClients: response.totalClients,
    totalListings: response.totalListings,
  });
  return response;
}

// ==================== Search API ====================

export async function searchProperties(query: SearchQuery): Promise<{
  listings: PropertyListing[];
  totalFound: number;
  sources: Array<{ source: string; success: boolean; count: number }>;
}> {
  console.log('[API] Searching properties:', query);
  const response = await apiRequest<{
    success: boolean;
    listings: PropertyListing[];
    totalFound: number;
    sources: Array<{ source: string; success: boolean; count: number; error?: string }>;
  }>('/api/search', {
    method: 'POST',
    body: JSON.stringify(query),
  });
  console.log('[API] Search results:', {
    totalFound: response.totalFound,
    sources: response.sources,
  });
  return response;
}

// ==================== Alerts API ====================

export async function getAlerts(): Promise<AlertsResponse> {
  console.log('[API] Fetching alerts');
  const response = await apiRequest<AlertsResponse>('/api/alerts');
  console.log('[API] Alerts fetched:', {
    totalAlerts: response.totalAlerts,
    totalNewListings: response.totalNewListings,
  });
  return response;
}

