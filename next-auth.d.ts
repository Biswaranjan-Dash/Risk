// next-auth.d.ts
import { Session } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      vehicleNumber?: string; // Add your custom property
      role?: string;         // Add your custom property
    };
  }
}