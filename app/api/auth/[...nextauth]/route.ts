import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: "Email/Vehicle Number", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
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

        // In production, use proper password hashing
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user._id,
          email: user.email,
          vehicleNumber: user.vehicleNumber,
          role: user.role,
          name: user.name,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.vehicleNumber = user.vehicleNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.vehicleNumber = token.vehicleNumber;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export { handler as GET, handler as POST };