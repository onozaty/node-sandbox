import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  /**
   * メールアドレス
   * @example taro@example.com
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
