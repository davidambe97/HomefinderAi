/**
 * Dashboard API for HomeFinder AI SaaS
 * Fetches property listings for all clients associated with an agent
 */

import { PropertyListing } from '../types';
import { listClients } from './clients';
import { searchProperties } from './searchProperties';
import { PublicUser, authMiddleware } from './users';

/**
 * TypeScript types for dashboard results
 */
export interface DashboardResult {
  clientId: string;
  clientName: string;
  clientEmail: string;
  listings: PropertyListing[];
  totalListings: number;
  searchCriteria: {
    location?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
  };
  error?: string;
}

export interface DashboardResponse {
  agentId: string;
  agentName: string;
  totalClients: number;
  totalListings: number;
  results: DashboardResult[];
}

/**
 * Fetch dashboard results for an authenticated agent
 * Retrieves all clients and their property listings
 * 
 * @param agentId - ID of the authenticated agent
 * @returns DashboardResponse with results for all clients
 */
export async function getDashboardResults(agentId: string): Promise<DashboardResponse> {
  try {
    console.log('[Dashboard] Fetching dashboard results for agent:', agentId);
    
    // Get all clients for this agent
    const clients = await listClients(agentId);
    console.log(`[Dashboard] Found ${clients.length} clients for agent:`, agentId);
    
    if (clients.length === 0) {
      console.log('[Dashboard] No clients found, returning empty dashboard');
      return {
        agentId,
        agentName: '', // Will be populated from auth if needed
        totalClients: 0,
        totalListings: 0,
        results: [],
      };
    }
    
    // Fetch listings for each client in parallel
    const dashboardPromises = clients.map(async (client): Promise<DashboardResult> => {
      try {
        console.log(`[Dashboard] Fetching listings for client: ${client.name} (${client.id})`);
        console.log(`[Dashboard] Search criteria:`, client.searchCriteria);
        
        // Search properties using client's search criteria
        const searchResult = await searchProperties(client.searchCriteria);
        
        const listings = searchResult.listings;
        const totalListings = listings.length;
        
        console.log(`[Dashboard] Found ${totalListings} listings for client: ${client.name}`);
        
        // Log sample listing for debugging
        if (listings.length > 0) {
          const sampleListing = listings[0];
          console.log(`[Dashboard] Sample listing for ${client.name}:`, {
            id: sampleListing.id,
            title: sampleListing.title,
            price: sampleListing.price,
            location: sampleListing.location,
            source: sampleListing.source,
          });
        }
        
        return {
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          listings,
          totalListings,
          searchCriteria: {
            location: client.searchCriteria.location,
            propertyType: client.searchCriteria.propertyType,
            minPrice: client.searchCriteria.minPrice,
            maxPrice: client.searchCriteria.maxPrice,
            bedrooms: client.searchCriteria.bedrooms,
            bathrooms: client.searchCriteria.bathrooms,
          },
        };
      } catch (error) {
        // If a client's scraper fails, continue with other clients
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[Dashboard] Error fetching listings for client ${client.name} (${client.id}):`, errorMessage);
        
        // Return empty listings array for failed clients
        return {
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          listings: [],
          totalListings: 0,
          searchCriteria: {
            location: client.searchCriteria.location,
            propertyType: client.searchCriteria.propertyType,
            minPrice: client.searchCriteria.minPrice,
            maxPrice: client.searchCriteria.maxPrice,
            bedrooms: client.searchCriteria.bedrooms,
            bathrooms: client.searchCriteria.bathrooms,
          },
          error: errorMessage,
        };
      }
    });
    
    // Wait for all client searches to complete (using allSettled to handle failures)
    const dashboardResults = await Promise.allSettled(dashboardPromises);
    
    // Extract results and handle any failures
    const results: DashboardResult[] = dashboardResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // If the entire promise failed (shouldn't happen, but handle it)
        const client = clients[index];
        const errorMessage = result.reason?.message || 'Unknown error';
        console.error(`[Dashboard] Unexpected error for client ${client.name}:`, errorMessage);
        
        return {
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          listings: [],
          totalListings: 0,
          searchCriteria: {
            location: client.searchCriteria.location,
            propertyType: client.searchCriteria.propertyType,
            minPrice: client.searchCriteria.minPrice,
            maxPrice: client.searchCriteria.maxPrice,
            bedrooms: client.searchCriteria.bedrooms,
            bathrooms: client.searchCriteria.bathrooms,
          },
          error: errorMessage,
        };
      }
    });
    
    // Calculate totals
    const totalListings = results.reduce((sum, result) => sum + result.totalListings, 0);
    
    console.log(`[Dashboard] Dashboard results complete:`);
    console.log(`[Dashboard] - Total clients: ${clients.length}`);
    console.log(`[Dashboard] - Total listings: ${totalListings}`);
    console.log(`[Dashboard] - Clients with listings: ${results.filter(r => r.totalListings > 0).length}`);
    console.log(`[Dashboard] - Clients with errors: ${results.filter(r => r.error).length}`);
    
    // Get agent name (optional - could be fetched from users API if needed)
    // For now, we'll use agentId
    return {
      agentId,
      agentName: '', // Can be populated from user lookup if needed
      totalClients: clients.length,
      totalListings,
      results,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard results';
    console.error('[Dashboard] Error fetching dashboard results:', errorMessage);
    throw error;
  }
}

/**
 * Helper function to get authenticated agent and fetch dashboard results
 * This wraps authMiddleware and getDashboardResults
 * 
 * Usage in API route:
 * ```typescript
 * export async function GET(req: Request) {
 *   const dashboard = await getDashboardForAuthenticatedAgent(req);
 *   if (!dashboard) {
 *     return createUnauthorizedResponse();
 *   }
 *   return createDashboardSuccessResponse(dashboard);
 * }
 * ```
 */
export async function getDashboardForAuthenticatedAgent(
  req: Request
): Promise<DashboardResponse | null> {
  try {
    // Authenticate agent
    const agent = await authMiddleware(req);
    
    if (!agent) {
      console.log('[Dashboard] Unauthorized access attempt');
      return null;
    }
    
    // Fetch dashboard results
    const dashboard = await getDashboardResults(agent.id);
    
    // Populate agent name
    dashboard.agentName = agent.name;
    
    return dashboard;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard';
    console.error('[Dashboard] Error in getDashboardForAuthenticatedAgent:', errorMessage);
    return null;
  }
}

/**
 * Helper function to create unauthorized response
 */
export function createDashboardUnauthorizedResponse(message: string = 'Unauthorized'): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Helper function to create error response
 */
export function createDashboardErrorResponse(message: string, status: number = 500): Response {
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
export function createDashboardSuccessResponse(data: DashboardResponse): Response {
  return new Response(
    JSON.stringify(data),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

