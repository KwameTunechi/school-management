import type { DefaultSession } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'admin' | 'teacher';
      full_name: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: 'admin' | 'teacher';
    full_name: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: 'admin' | 'teacher';
    full_name: string;
  }
}
