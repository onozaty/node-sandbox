import { Expose } from 'class-transformer';

export class AuthedUserDto {
  /**
   * ユーザID
   * @example 1
   */
  @Expose()
  userId: number;

  /**
   * メールアドレス
   * @example taro@example.com
   */
  @Expose()
  email: string;

  constructor(partial: Partial<AuthedUserDto>) {
    Object.assign(this, partial);
  }
}
