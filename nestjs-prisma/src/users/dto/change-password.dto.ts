import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  /**
   * 旧パスワード
   * @example password
   */
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  /**
   * 新パスワード
   * @example password
   */
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
  })
  newPassword: string;
}
