import { 
  listClients, 
  addClient, 
  getAuthenticatedAgent,
  createClientErrorResponse,
  createClientSuccessResponse,
} from '../../../../server/api/clients';
import { createUnauthorizedResponse } from '../../../../server/api/users';

export async function GET(req: Request) {
  try {
    const agent = await getAuthenticatedAgent(req);
    if (!agent) {
      return createUnauthorizedResponse();
    }
    
    const clients = await listClients(agent.id);
    return createClientSuccessResponse({ clients });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch clients';
    return createClientErrorResponse(message, 500);
  }
}

export async function POST(req: Request) {
  try {
    const agent = await getAuthenticatedAgent(req);
    if (!agent) {
      return createUnauthorizedResponse();
    }
    
    const body = await req.json();
    const client = await addClient(body, agent.id);
    return createClientSuccessResponse(client, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add client';
    return createClientErrorResponse(message, 400);
  }
}

