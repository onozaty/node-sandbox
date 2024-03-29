import { Expose } from 'class-transformer';

export class TokenDto {
  /**
   * アクセストークン
   * @example xxxxxxx
   */
  @Expose()
  accessToken: string;

  /**
   * リフレッシュトークン
   * @example xxxxxxx
   */
  @Expose()
  refreshToken: string;

  constructor(partial: Partial<TokenDto>) {
    Object.assign(this, partial);
  }
}
