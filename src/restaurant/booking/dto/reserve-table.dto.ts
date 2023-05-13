import { Type } from 'class-transformer';
import {
  IsAlpha,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  Min,
} from 'class-validator';

export class ReserveTableDto {
  @IsNotEmpty()
  @IsAlpha()
  customer_name: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  customer_amount: number;

  @IsNotEmpty()
  @IsDateString()
  booking_time: Date;
}
