import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Simplified middleware function
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define authentication-related paths
    const isAuthPath = path === '/login' || path === '/register' ||
        path.startsWith('/login') || path.startsWith('/register');
    const isApiPath = path.startsWith('/api/');
    const isApiAuthPath = path.startsWith('/api/auth/');
    const isRootPath = path === '/';

    try {
        // Check for auth cookie directly to avoid getToken issues
        const hasAuthCookie = request.cookies.has('next-auth.session-token') ||
            request.cookies.has('__Secure-next-auth.session-token');

        // Special case for root path
        if (isRootPath) {
            return NextResponse.redirect(new URL(hasAuthCookie ? '/dashboard' : '/login', request.url));
        }

        // Handle auth paths (login, register)
        if (isAuthPath) {
            if (hasAuthCookie) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
            return NextResponse.next();
        }

        // Handle protected paths
        if (!hasAuthCookie) {
            // Skip auth check for API auth paths
            if (isApiAuthPath) {
                return NextResponse.next();
            }

            // API routes return 401
            if (isApiPath) {
                return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
            }

            // Other routes redirect to login
            return NextResponse.redirect(new URL('/login', request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Middleware error:', error);
        // In case of error, proceed to the page
        return NextResponse.next();
    }
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Include specific routes we want to protect:
         * - Dashboard and its subroutes
         * - API routes (except auth)
         * - Root path
         */
        '/dashboard/:path*',
        '/api/:path*',
        '/',
        '/login',
        '/register'
    ],
};