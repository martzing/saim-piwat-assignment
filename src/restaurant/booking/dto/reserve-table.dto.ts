import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  Min,
} from 'class-validator';

export class ReserveTableDto {
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
