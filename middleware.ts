import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const path = req.nextUrl.pathname;
      
      // Public paths
      if (path === '/' || path.startsWith('/auth')) {
        return true;
      }

      // Protected paths
      if (!token) {
        return false;
      }

      // Insurance company routes
      if (path.startsWith('/dashboard/insurance')) {
        return token.role === 'insurance';
      }

      // Customer routes
      if (path.startsWith('/dashboard/customer')) {
        return token.role === 'customer';
      }

      return !!token;
    },
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/customers/:path*',
    '/api/vehicle-data/:path*',
  ],
};