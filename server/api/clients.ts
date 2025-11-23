/**
 * Client management API for HomeFinder AI SaaS
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { SearchQuery } from '../types';
import { PublicUser, authMiddleware } from './users';

/**
 * TypeScript types for client management
 */
export interface Client {
  id: string;
  name: string;
  email: string;
  searchCriteria: SearchQuery;
  agentId: string; // ID of the agent/user who owns this client
  createdAt: string;
  updatedAt: string;
}

export interface ClientQuery {
  name?: string;
  email?: string;
  searchCriteria?: SearchQuery;
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

/**
 * Database file path
 */
const DB_DIR = join(process.cwd(), 'server', 'db');
const CLIENTS_FILE = join(DB_DIR, 'clients.json');

/**
 * Initialize database directory and file if they don't exist
 */
async function ensureDbExists(): Promise<void> {
  try {
    if (!existsSync(DB_DIR)) {
      await mkdir(DB_DIR, { recursive: true });
      console.log('[Clients] Created database directory:', DB_DIR);
    }
    
    if (!existsSync(CLIENTS_FILE)) {
      await writeFile(CLIENTS_FILE, JSON.stringify([], null, 2), 'utf-8');
      console.log('[Clients] Created clients database file:', CLIENTS_FILE);
    }
  } catch (error) {
    console.error('[Clients] Error ensuring database exists:', error);
    throw new Error('Failed to initialize database');
  }
}

/**
 * Read clients from JSON file
 */
async function readClients(): Promise<Client[]> {
  try {
    await ensureDbExists();
    const data = await readFile(CLIENTS_FILE, 'utf-8');
    return JSON.parse(data) as Client[];
  } catch (error) {
    console.error('[Clients] Error reading clients:', error);
    return [];
  }
}

/**
 * Write clients to JSON file
 */
async function writeClients(clients: Client[]): Promise<void> {
  try {
    await ensureDbExists();
    await writeFile(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf-8');
  } catch (error) {
    console.error('[Clients] Error writing clients:', error);
    throw new Error('Failed to save client data');
  }
}

/**
 * Generate unique client ID
 */
function generateClientId(): string {
  return `client_${randomBytes(16).toString('hex')}`;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate search criteria
 */
function validateSearchCriteria(criteria: SearchQuery): boolean {
  // Basic validation - at least location should be provided
  if (!criteria.location || criteria.location.trim() === '') {
    return false;
  }
  return true;
}

/**
 * Add a new client
 * @param data - Client data (name, email, searchCriteria)
 * @param agentId - ID of the authenticated agent
 * @returns Created client
 */
export async function addClient(
  data: AddClientRequest,
  agentId: string
): Promise<Client> {
  try {
    console.log('[Clients] Add client attempt for agent:', agentId, 'email:', data.email);
    
    // Validate input
    if (!data.name || !data.email || !data.searchCriteria) {
      throw new Error('Name, email, and searchCriteria are required');
    }
    
    if (data.name.trim() === '') {
      throw new Error('Name cannot be empty');
    }
    
    if (!isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    
    if (!validateSearchCriteria(data.searchCriteria)) {
      throw new Error('Search criteria must include a location');
    }
    
    // Read existing clients
    const clients = await readClients();
    
    // Check if client with same email already exists for this agent
    const existingClient = clients.find(
      c => c.email.toLowerCase() === data.email.toLowerCase() && c.agentId === agentId
    );
    
    if (existingClient) {
      console.log('[Clients] Add client failed: Email already exists for this agent:', data.email);
      throw new Error('A client with this email already exists');
    }
    
    // Create new client
    const now = new Date().toISOString();
    const newClient: Client = {
      id: generateClientId(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      searchCriteria: {
        location: data.searchCriteria.location?.trim(),
        propertyType: data.searchCriteria.propertyType,
        minPrice: data.searchCriteria.minPrice,
        maxPrice: data.searchCriteria.maxPrice,
        bedrooms: data.searchCriteria.bedrooms,
        bathrooms: data.searchCriteria.bathrooms,
        ...data.searchCriteria,
      },
      agentId,
      createdAt: now,
      updatedAt: now,
    };
    
    // Save client
    clients.push(newClient);
    await writeClients(clients);
    
    console.log('[Clients] Client added successfully:', newClient.id, newClient.email);
    
    return newClient;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add client';
    console.error('[Clients] Add client error:', errorMessage);
    throw error;
  }
}

/**
 * Update an existing client
 * @param clientId - ID of the client to update
 * @param data - Updated client data
 * @param agentId - ID of the authenticated agent
 * @returns Updated client
 */
export async function updateClient(
  clientId: string,
  data: UpdateClientRequest,
  agentId: string
): Promise<Client> {
  try {
    console.log('[Clients] Update client attempt:', clientId, 'for agent:', agentId);
    
    // Read existing clients
    const clients = await readClients();
    
    // Find client
    const clientIndex = clients.findIndex(
      c => c.id === clientId && c.agentId === agentId
    );
    
    if (clientIndex === -1) {
      console.log('[Clients] Update client failed: Client not found:', clientId);
      throw new Error('Client not found or access denied');
    }
    
    const client = clients[clientIndex];
    
    // Validate updates
    if (data.email && !isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    
    if (data.name !== undefined && data.name.trim() === '') {
      throw new Error('Name cannot be empty');
    }
    
    if (data.searchCriteria && !validateSearchCriteria(data.searchCriteria)) {
      throw new Error('Search criteria must include a location');
    }
    
    // Check if email is being changed and if it conflicts with another client
    if (data.email && data.email.toLowerCase() !== client.email.toLowerCase()) {
      const newEmailLower = data.email.toLowerCase();
      const emailExists = clients.some(
        c => c.email.toLowerCase() === newEmailLower &&
             c.agentId === agentId &&
             c.id !== clientId
      );
      
      if (emailExists) {
        console.log('[Clients] Update client failed: Email already exists:', data.email);
        throw new Error('A client with this email already exists');
      }
    }
    
    // Update client
    const updatedClient: Client = {
      ...client,
      name: data.name !== undefined ? data.name.trim() : client.name,
      email: data.email ? data.email.toLowerCase().trim() : client.email,
      searchCriteria: data.searchCriteria
        ? {
            ...client.searchCriteria,
            ...data.searchCriteria,
            location: data.searchCriteria.location?.trim() || client.searchCriteria.location,
          }
        : client.searchCriteria,
      updatedAt: new Date().toISOString(),
    };
    
    // Save updated client
    clients[clientIndex] = updatedClient;
    await writeClients(clients);
    
    console.log('[Clients] Client updated successfully:', updatedClient.id);
    
    return updatedClient;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update client';
    console.error('[Clients] Update client error:', errorMessage);
    throw error;
  }
}

/**
 * List all clients for an agent
 * @param agentId - ID of the authenticated agent
 * @param query - Optional filter query (name, email, searchCriteria)
 * @returns Array of clients
 */
export async function listClients(
  agentId: string,
  query?: ClientQuery
): Promise<Client[]> {
  try {
    console.log('[Clients] List clients for agent:', agentId);
    
    // Read all clients
    const allClients = await readClients();
    
    // Filter by agent
    let clients = allClients.filter(c => c.agentId === agentId);
    
    // Apply optional filters
    if (query) {
      if (query.name) {
        const nameLower = query.name.toLowerCase();
        clients = clients.filter(c => c.name.toLowerCase().includes(nameLower));
      }
      
      if (query.email) {
        const emailLower = query.email.toLowerCase();
        clients = clients.filter(c => c.email.toLowerCase().includes(emailLower));
      }
      
      if (query.searchCriteria) {
        // Filter by search criteria properties
        const criteria = query.searchCriteria;
        
        if (criteria.location) {
          const locationLower = criteria.location.toLowerCase();
          clients = clients.filter(
            c => c.searchCriteria.location?.toLowerCase().includes(locationLower)
          );
        }
        
        if (criteria.propertyType) {
          clients = clients.filter(
            c => c.searchCriteria.propertyType === criteria.propertyType
          );
        }
        
        if (criteria.minPrice !== undefined) {
          const minPrice = criteria.minPrice;
          clients = clients.filter(
            c => (c.searchCriteria.minPrice || 0) >= minPrice
          );
        }
        
        if (criteria.maxPrice !== undefined) {
          const maxPrice = criteria.maxPrice;
          clients = clients.filter(
            c => (c.searchCriteria.maxPrice || Infinity) <= maxPrice
          );
        }
        
        if (criteria.bedrooms !== undefined) {
          const bedrooms = criteria.bedrooms;
          clients = clients.filter(
            c => (c.searchCriteria.bedrooms || 0) >= bedrooms
          );
        }
      }
    }
    
    // Sort by most recently updated first
    clients.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    console.log(`[Clients] Found ${clients.length} clients for agent:`, agentId);
    
    return clients;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to list clients';
    console.error('[Clients] List clients error:', errorMessage);
    throw error;
  }
}

/**
 * Get a single client by ID
 * @param clientId - ID of the client
 * @param agentId - ID of the authenticated agent
 * @returns Client or null if not found
 */
export async function getClientById(
  clientId: string,
  agentId: string
): Promise<Client | null> {
  try {
    const clients = await readClients();
    const client = clients.find(
      c => c.id === clientId && c.agentId === agentId
    );
    
    if (!client) {
      console.log('[Clients] Client not found:', clientId, 'for agent:', agentId);
      return null;
    }
    
    return client;
  } catch (error) {
    console.error('[Clients] Error getting client by ID:', error);
    return null;
  }
}

/**
 * Delete a client
 * @param clientId - ID of the client to delete
 * @param agentId - ID of the authenticated agent
 * @returns true if successful, false otherwise
 */
export async function deleteClient(
  clientId: string,
  agentId: string
): Promise<boolean> {
  try {
    console.log('[Clients] Delete client attempt:', clientId, 'for agent:', agentId);
    
    // Read existing clients
    const clients = await readClients();
    
    // Find client index
    const clientIndex = clients.findIndex(
      c => c.id === clientId && c.agentId === agentId
    );
    
    if (clientIndex === -1) {
      console.log('[Clients] Delete client failed: Client not found:', clientId);
      throw new Error('Client not found or access denied');
    }
    
    // Remove client
    clients.splice(clientIndex, 1);
    await writeClients(clients);
    
    console.log('[Clients] Client deleted successfully:', clientId);
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete client';
    console.error('[Clients] Delete client error:', errorMessage);
    throw error;
  }
}

/**
 * Helper function to create error response
 */
export function createClientErrorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Helper function to create success response
 */
export function createClientSuccessResponse<T>(data: T, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Helper function to ensure authenticated agent before client operations
 * This wraps authMiddleware and extracts agentId
 * 
 * Usage in API route:
 * ```typescript
 * export async function POST(req: Request) {
 *   const agent = await getAuthenticatedAgent(req);
 *   if (!agent) {
 *     return createUnauthorizedResponse();
 *   }
 *   const client = await addClient(data, agent.id);
 *   return createClientSuccessResponse(client);
 * }
 * ```
 */
export async function getAuthenticatedAgent(req: Request): Promise<PublicUser | null> {
  return authMiddleware(req);
}

