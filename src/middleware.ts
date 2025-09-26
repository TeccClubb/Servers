import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function needs to be async to use getToken
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define public paths that don't require authentication
    const isPublicPath =
        path === '/login' ||
        path === '/register' ||
        path.startsWith('/api/auth') ||
        path === '/';

    // Get the token using next-auth's getToken helper
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    // If the path is exactly '/', handle special redirection
    if (path === '/') {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If the user is not authenticated and trying to access a protected route
    if (!token && !isPublicPath) {
        // For API routes, return unauthorized status
        if (path.startsWith('/api/')) {
            return NextResponse.json(
                { message: 'Authentication required' },
                { status: 401 }
            );
        }

        // For other routes, redirect to login with callback URL
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', encodeURIComponent(request.url));
        return NextResponse.redirect(url);
    }

    // If the user is authenticated and trying to access login/register page
    if (token && (path === '/login' || path === '/register')) {
        // Redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api/auth (authentication API routes which need to be public)
         */
        '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
    ],
};