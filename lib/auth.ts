import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import getDb from './db';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const db = getDb();
        const user = db
          .prepare('SELECT * FROM users WHERE email = ?')
          .get(credentials.email) as {
            id: number;
            email: string;
            password_hash: string;
            full_name: string;
            role: 'admin' | 'teacher';
          } | undefined;

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;

        return {
          id:        String(user.id),
          email:     user.email,
          name:      user.full_name,
          full_name: user.full_name,
          role:      user.role,
        };
      },
    }),
  ],

  session: { strategy: 'jwt' },

  secret: process.env.NEXTAUTH_SECRET,

  pages: { signIn: '/login' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id        = user.id;
        token.role      = user.role;
        token.full_name = user.full_name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id        = token.id;
      session.user.role      = token.role;
      session.user.full_name = token.full_name;
      return session;
    },
  },
};
