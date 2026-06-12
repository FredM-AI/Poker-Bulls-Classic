
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import type { LoginFormState } from '@/lib/definitions';
import { cookies } from 'next/headers';

const LoginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'pbc_pwd25'; 

const FLOOR_MANAGER_USERNAME = 'floor';
const FLOOR_MANAGER_PASSWORD = 'pbc_floor25';

const AUTH_COOKIE_NAME = 'app_session_active';

export async function loginUser(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check your input.',
    };
  }

  const { username, password } = validatedFields.data;

  let role = '';
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    role = 'admin';
  } else if (username === FLOOR_MANAGER_USERNAME && password === FLOOR_MANAGER_PASSWORD) {
    role = 'floor_manager';
  }

  if (role) {
    (await cookies()).set(AUTH_COOKIE_NAME, role, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'none', 
      secure: true, 
    });
    redirect('/dashboard');
  } else {
    return {
      errors: { _form: ['Invalid username or password.'] },
      message: 'Invalid username or password.',
    };
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, '', { 
        httpOnly: true,
        path: '/',
        sameSite: 'none', 
        secure: true,
        expires: new Date(0)
    });
  } catch (error) {
    console.error('[Logout] Error during cookie clearing:', error);
  }
  redirect('/login');
}
