import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@drmudhiwalla.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: 'Staff Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (credentials.email === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD) {
          return { id: '1', name: 'Admin', email: ADMIN_EMAIL };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = 'admin';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/staff/login',
  },
});
