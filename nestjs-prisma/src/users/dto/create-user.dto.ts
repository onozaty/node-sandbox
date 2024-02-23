import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  /**
   * メールアドレス
   * @example taro@example.com
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
