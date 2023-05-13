import { Body, Controller, Patch, Post } from '@nestjs/common';
import { InitTableDto } from './dto/init-table.dto';
import {
  CancelReserveTableResponse,
  ClearTableResponse,
  InitTableResponse,
  ReserveTableResponse,
  UseReserveTableResponse,
} from './type';
import { BookingService } from './booking.service';
import { ReserveTableDto } from './dto/reserve-table.dto';
import { CancelReserveTableDto } from './dto/cancel-reserve-table.dto';
import { UseReserveTableDto } from './dto/use-reserve-table';
import { ClearTableDto } from './dto/clear-table.dto';

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
      customerName: body.customer_name,
      custumerAmount: body.customer_amount,
      bookingTime: body.booking_time,
    });
  }

  @Patch('/table/cancel')
  cancelReserveTable(
    @Body() body: CancelReserveTableDto,
  ): CancelReserveTableResponse {
    return this.bookingService.cancelReserveTable(body.booking_id);
  }

  @Patch('/table/use')
  useReserveTable(@Body() body: UseReserveTableDto): UseReserveTableResponse {
    return this.bookingService.useReserveTable(body.booking_id);
  }

  @Patch('/table/clear')
  clearTable(@Body() body: ClearTableDto): ClearTableResponse {
    return this.bookingService.clearTable(body.table_ids);
  }
}
