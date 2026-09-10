import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@drmudiwalla.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin987';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Staff Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        if (credentials.email === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD) {
          return { id: '1', name: 'Admin', email: ADMIN_EMAIL, role: 'admin' };
        }
        return null;
      },
    }),
  ],
  session: {
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/staff/login',
  },
});
