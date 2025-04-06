// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      vehicleNumber?: string;
      role?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    vehicleNumber: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    vehicleNumber: string;
    role: string;
  }
}
