import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  /**
   * メールアドレス
   * @example taro@example.com
   */
  @IsNotEmpty()
  email: string;

  /**
   * パスワード
   * @example password
   */
  @IsNotEmpty()
  password: string;
}
