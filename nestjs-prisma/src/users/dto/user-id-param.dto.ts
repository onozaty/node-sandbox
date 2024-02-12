import { Type } from 'class-transformer';

export class UserIdParamDto {
  /**
   * ユーザID
   * @example 1
   */
  @Type(() => Number)
  id: number;
}
