import { IsNotEmpty, IsUUID } from 'class-validator';

export class UseReserveTableDto {
  @IsNotEmpty()
  @IsUUID()
  booking_id: string;
}
