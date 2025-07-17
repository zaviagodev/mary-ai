import { createUser } from '@/lib/db/queries';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    await createUser(email, password);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Registration failed.' }, { status: 500 });
  }
} 