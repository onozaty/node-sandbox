import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class UserIdParamDto {
  /**
   * ユーザID
   * @example 1
   */
  @IsNumber()
  @Type(() => Number)
  id: number;
}
