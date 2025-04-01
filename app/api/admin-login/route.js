import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export async function POST(request) {
  const formData = await request.formData()
  const password = formData.get('password')

  if (password === ADMIN_PASSWORD) {
    // Set authentication cookie
    cookies().set('admin-authenticated', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    })

    return NextResponse.redirect(new URL('/approve-issuers', request.url))
  }

  return NextResponse.redirect(new URL('/approve-issuers?error=1', request.url))
}