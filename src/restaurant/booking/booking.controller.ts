import { Body, Controller, Post } from '@nestjs/common';
import { InitTableDto } from './dto/init-table.dto';
import { CreateTableResponse } from './type';
import { BookingService } from './booking.service';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('/table/init')
  initTable(@Body() body: InitTableDto): CreateTableResponse {
    return this.bookingService.initTable(body.amount);
  }
}
