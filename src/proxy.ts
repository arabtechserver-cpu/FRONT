import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n/config';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_strong_secret_key_here';

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales;
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    return matchLocale(languages, locales, i18n.defaultLocale);
  } catch {
    return i18n.defaultLocale;
  }
}

export async function proxy(request: NextRequest) {
  const nextAction = request.headers.get('next-action');
  if (nextAction !== null) {
    if (!/^[a-f0-9]{42}$/i.test(nextAction)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Invalid or outdated action reference',
          code: 'INVALID_SERVER_ACTION',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  const pathname = request.nextUrl.pathname;

  if (pathname === '/api-docs' || pathname.startsWith('/api-docs')) {
    return new NextResponse(null, { status: 404 });
  }

  if (
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.png' ||
    pathname === '/apple-icon.png' ||
    pathname === '/main-logo.png' ||
    pathname === '/borai-logo.png' ||
    pathname.startsWith('/borai-favicon') ||
    pathname === '/og-image.png' ||
    pathname === '/llms.txt' ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/videos/') ||
    pathname.startsWith('/uploads/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/.well-known/') ||
    /\.(woff|woff2|eot|ttf|otf|png|jpg|jpeg|gif|svg|ico|webp|txt|xml|json|mp4|webm|ogg|m4v)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();

    const token = request.cookies.get('admin_token')?.value;
    if (!token || !JWT_SECRET || JWT_SECRET.length < 32) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      if (payload.role !== 'admin' && payload.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    if (pathname === '' || pathname === '/') {
      return NextResponse.rewrite(new URL(`/${locale}`, request.url));
    }
    return NextResponse.redirect(new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url));
  }
}

export const config = {
  matcher: ['/((?!api/|_next/static|_next/image|fonts|images|videos|uploads|sitemap.xml|robots.txt|favicon.ico|icon.png|apple-icon.png|main-logo.png|borai-logo.png|og-image.png|llms.txt).*)'],
};
