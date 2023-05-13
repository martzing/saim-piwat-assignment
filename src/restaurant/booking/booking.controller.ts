import { Body, Controller, Post } from '@nestjs/common';
import { InitTableDto } from './dto/init-table.dto';
import {
  CancelReserveTableResponse,
  InitTableResponse,
  ReserveTableResponse,
} from './type';
import { BookingService } from './booking.service';
import { ReserveTableDto } from './dto/reserve-table.dto';
import { CancelReserveTableDto } from './dto/cancel-reserve-table.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('/table/init')
  initTable(@Body() body: InitTableDto): InitTableResponse {
    return this.bookingService.initTable(body.amount);
  }

  @Post('/table/reserve')
  reserveTable(@Body() body: ReserveTableDto): ReserveTableResponse {
    return this.bookingService.reserveTable({
      custumerAmount: body.customer_amount,
      bookingTime: body.booking_time,
    });
  }

  @Post('/table/cancel')
  cancelReserveTable(
    @Body() body: CancelReserveTableDto,
  ): CancelReserveTableResponse {
    return this.bookingService.cancelReserveTable(body.booking_id);
  }
}
