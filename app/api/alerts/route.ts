import { 
  getDashboardForAuthenticatedAgent,
  createDashboardUnauthorizedResponse,
  createDashboardErrorResponse,
} from '../../../server/api/dashboard';
import {
  generateAlertsResponse,
  dashboardResultsToListingsMap,
  extractClientNames,
  listingHistory,
} from '../../../server/utils/alerts';
import { createSuccessResponse } from '../../../server/api/users';

export async function GET(req: Request) {
  try {
    const dashboard = await getDashboardForAuthenticatedAgent(req);
    
    if (!dashboard) {
      return createDashboardUnauthorizedResponse();
    }
    
    // Get current listings
    const currentListings = dashboardResultsToListingsMap(dashboard.results);
    const clientNames = extractClientNames(dashboard.results);
    
    // Get previous listings from history
    const previousListings = listingHistory.getAll();
    
    // Generate alerts
    const alertsResponse = generateAlertsResponse(
      previousListings,
      currentListings,
      clientNames
    );
    
    // Update history with current listings
    for (const result of dashboard.results) {
      listingHistory.set(result.clientId, result.listings);
    }
    
    return createSuccessResponse(alertsResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch alerts';
    return createDashboardErrorResponse(message, 500);
  }
}

