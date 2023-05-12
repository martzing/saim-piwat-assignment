import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, Min } from 'class-validator';

export class InitTableDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  amount: number;
}
