import { IsNotEmpty, IsUUID } from 'class-validator';

export class CancelReserveTableDto {
  @IsNotEmpty()
  @IsUUID()
  booking_id: string;
}
