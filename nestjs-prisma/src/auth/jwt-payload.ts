import { User } from '@prisma/client';

export interface JwtPayload {
  readonly sub: number;
  readonly username: string;
}

export function createJwtPayload(
  user: Pick<User, 'userId' | 'email'>,
): JwtPayload {
  return { sub: user.userId, username: user.email };
}
