import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: "Email/Vehicle Number", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await dbConnect();
          
          if (!credentials?.identifier || !credentials?.password) {
            throw new Error('Please enter all fields');
          }

          const user = await User.findOne({
            $or: [
              { email: credentials.identifier },
              { vehicleNumber: credentials.identifier }
            ]
          });

          if (!user) {
            throw new Error('Invalid credentials');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            vehicleNumber: user.vehicleNumber,
            role: user.role,
            name: user.name,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.vehicleNumber = user.vehicleNumber;
        token.id = user.id;
      }
  
      return {
        ...token,
        role: token.role ?? null,
        vehicleNumber: token.vehicleNumber ?? null,
        id: token.id ?? null,
      };
    },
  
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.vehicleNumber = token.vehicleNumber;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};