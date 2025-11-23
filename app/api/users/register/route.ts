import { registerUser, createErrorResponse, createSuccessResponse } from '../../../../server/api/users';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await registerUser(body);
    return createSuccessResponse(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return createErrorResponse(message, 400);
  }
}

