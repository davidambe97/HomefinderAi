import { 
  updateClient, 
  deleteClient,
  getClientById,
  getAuthenticatedAgent,
  createClientErrorResponse,
  createClientSuccessResponse,
} from '../../../../../server/api/clients';
import { createUnauthorizedResponse } from '../../../../../server/api/users';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await getAuthenticatedAgent(req);
    if (!agent) {
      return createUnauthorizedResponse();
    }
    
    const client = await getClientById(params.id, agent.id);
    if (!client) {
      return createClientErrorResponse('Client not found', 404);
    }
    
    return createClientSuccessResponse(client);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch client';
    return createClientErrorResponse(message, 500);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await getAuthenticatedAgent(req);
    if (!agent) {
      return createUnauthorizedResponse();
    }
    
    const body = await req.json();
    const client = await updateClient(params.id, body, agent.id);
    return createClientSuccessResponse(client);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update client';
    return createClientErrorResponse(message, 400);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await getAuthenticatedAgent(req);
    if (!agent) {
      return createUnauthorizedResponse();
    }
    
    await deleteClient(params.id, agent.id);
    return createClientSuccessResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete client';
    return createClientErrorResponse(message, 400);
  }
}

