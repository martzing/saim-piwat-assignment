import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  BookingTransaction,
  InitTableResponse,
  ReserveTableData,
  ReserveTableResponse,
  Table,
} from './type';
import dayjs from 'dayjs';

@Injectable()
export class BookingService {
  private tableList: Table[] = [];
  private bookingTransactionList: BookingTransaction[] = [];

  initTable(amount: number): InitTableResponse {
    if (this.tableList.length > 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: ['Table already initialize'],
          error: 'Conflict',
        },
        HttpStatus.CONFLICT,
      );
    }
    for (let i = 1; i <= amount; i++) {
      this.tableList.push({
        id: i,
        name: `Table_${i}`,
        status: 'available',
      });
    }
    return { message: 'Initialize table success.' };
  }

  reserveTable({
    custumerAmount,
    bookingTime,
  }: ReserveTableData): ReserveTableResponse {
    if (this.tableList.length <= 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['The restaurant is closed, please come back again'],
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const now = dayjs();
    if (dayjs(bookingTime).diff(now, 'minute') < 30) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['Please make a reservation 30 minutes in advance'],
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const bookingTableAmount = Math.ceil(custumerAmount / 4);
    const tables = this.tableList.filter((t) => t.status === 'available');
    if (bookingTableAmount > tables.length) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['Table amount not enough'],
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const transactionId = uuidv4();
    const reserveTable = [];
    for (let i = 0; i < bookingTableAmount; i++) {
      tables[i].status = 'unavailable';
      reserveTable.push(tables[i]);
    }

    this.bookingTransactionList.push({
      id: transactionId,
      custumerAmount,
      bookingTime,
      tables: reserveTable,
      trasactionTime: now.toDate(),
    });

    return {
      booking_id: transactionId,
      booking_table_amount: bookingTableAmount,
      table_remaining_amount: tables.length - bookingTableAmount,
    };
  }
}
