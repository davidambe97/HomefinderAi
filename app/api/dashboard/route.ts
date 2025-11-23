import { 
  getDashboardForAuthenticatedAgent,
  createDashboardUnauthorizedResponse,
  createDashboardErrorResponse,
  createDashboardSuccessResponse,
} from '../../../../server/api/dashboard';

export async function GET(req: Request) {
  try {
    const dashboard = await getDashboardForAuthenticatedAgent(req);
    
    if (!dashboard) {
      return createDashboardUnauthorizedResponse();
    }
    
    return createDashboardSuccessResponse(dashboard);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard';
    return createDashboardErrorResponse(message, 500);
  }
}

