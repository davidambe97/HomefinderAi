import { loginUser, createErrorResponse, createSuccessResponse } from '../../../../server/api/users';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await loginUser(body);
    return createSuccessResponse(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return createErrorResponse(message, 400);
  }
}

