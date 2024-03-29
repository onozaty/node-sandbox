import { Expose } from 'class-transformer';

export class UserDto {
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

  /**
   * 作成日時
   */
  @Expose()
  createdAt: Date;

  /**
   * 更新日時
   */
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
