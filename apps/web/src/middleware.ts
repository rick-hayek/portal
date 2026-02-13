import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const { pathname } = req.nextUrl;

    // Protect admin routes — require authenticated admin
    if (pathname.startsWith('/admin')) {
        if (!req.auth) {
            const signInUrl = new URL('/auth/signin', req.nextUrl.origin);
            signInUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(signInUrl);
        }
        if (req.auth.user.role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.nextUrl.origin));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/admin/:path*'],
};
