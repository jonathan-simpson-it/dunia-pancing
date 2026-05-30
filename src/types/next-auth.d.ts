import { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface User extends DefaultUser {
    username?: string
    role?: string
    shopId?: string
    shopName?: string
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      username?: string
      role?: string
      shopId?: string
      shopName?: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    username?: string
    role?: string
    shopId?: string
    shopName?: string
  }
}
