import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Page → allowed roles
const PAGE_ROLES: Record<string, string[]> = {
  '/admin': ['Admin', 'Senior Reviewer'],
  '/analytics': ['Admin', 'Senior Reviewer'],
  '/management': ['Admin'],
  '/review': ['Admin', 'Senior Reviewer', 'Reviewer', 'Trainee'],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Must match AuthContext.tsx exactly
  const role = request.cookies.get('twn_role')?.value

  // Only protect matched pages
  if (!role) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  for (const [page, allowedRoles] of Object.entries(PAGE_ROLES)) {
    if (pathname.startsWith(page) && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/review/:path*',
    '/analytics/:path*',
    '/management/:path*',
  ],
}