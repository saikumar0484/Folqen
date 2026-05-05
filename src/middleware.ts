export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/agent/:path*',
    '/pipeline/:path*',
    '/calendar/:path*',
    '/library/:path*',
    '/approvals/:path*',
    '/platforms/:path*',
    '/tools/:path*',
    '/settings/:path*',
    '/analytics/:path*',
    '/monetization/:path*',
    '/brand/:path*',
    '/errors/:path*',
    '/audit/:path*',
    '/workflows/:path*',
    '/files/:path*',
    '/notifications/:path*',
    '/upgrades/:path*',
    '/api/agent/:path*',
  ],
}
