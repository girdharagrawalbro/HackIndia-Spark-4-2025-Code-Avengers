"use server";
import { cookies } from 'next/headers';

export async function getAdminAuthStatus() {
    return cookies().get('admin-authenticated')?.value === 'true';
}
