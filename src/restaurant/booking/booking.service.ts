import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  BookingTransaction,
  CancelReserveTableResponse,
  ClearTableResponse,
  InitTableResponse,
  ReserveTableData,
  ReserveTableResponse,
  Table,
  UseReserveTableResponse,
} from './type';
import dayjs from './../../utils/dayjs';

@Injectable()
export class BookingService {
  public tableList: Table[] = [];
  public bookingTransactionList: BookingTransaction[] = [];

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
    return { message: 'Initialize table success' };
  }

  reserveTable({
    customerName,
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
    const bookingTimeObj = dayjs(bookingTime);
    if (bookingTimeObj.diff(now, 'minute') < 30) {
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
      customerName,
      custumerAmount,
      bookingTime,
      tables: reserveTable,
      status: 'waiting',
      trasactionTime: now.toDate(),
    });

    // auto cancel booking if customer late 30 minute
    setTimeout(
      () => this.cancelReserveTable(transactionId),
      bookingTimeObj.add(30, 'minute').diff(now, 'millisecond'),
    );

    return {
      booking_id: transactionId,
      booking_table_amount: bookingTableAmount,
      table_remaining_amount: tables.length - bookingTableAmount,
    };
  }

  cancelReserveTable(bookingId: string): CancelReserveTableResponse {
    if (this.tableList.length <= 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['Cannot cancel booking because the restaurant is closed'],
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const bookingTxn = this.bookingTransactionList.find(
      (txn) => txn.id === bookingId,
    );

    if (!bookingTxn) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: ['Booking id not found'],
          error: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (bookingTxn.status !== 'waiting') {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['Booking status cannot cancel'],
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const { tables } = bookingTxn;
    tables.forEach((t) => {
      t.status = 'available';
    });
    bookingTxn.status = 'cancel';
    const availableTables = this.tableList.filter(
      (t) => t.status === 'available',
    );

    return {
      freed_table_amount: tables.length,
      table_remaining_amount: availableTables.length,
    };
  }

  useReserveTable(bookingId: string): UseReserveTableResponse {
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

    const bookingTxn = this.bookingTransactionList.find(
      (txn) => txn.id === bookingId,
    );

    if (!bookingTxn) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: ['Booking id not found'],
          error: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (bookingTxn.status !== 'waiting') {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['Booking status cannot set to complete'],
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const now = dayjs();
    const bookingTime = dayjs(bookingTxn.bookingTime);

    if (now.isBefore(bookingTime)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['Sorry, You came too early'],
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (now.diff(bookingTime, 'minute') > 30) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['Sorry, You came too late'],
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    bookingTxn.status = 'complete';

    return bookingTxn.tables.map((t) => ({
      table_id: t.id,
      table_name: t.name,
    }));
  }

  clearTable(tableIds: number[]): ClearTableResponse {
    if (this.tableList.length <= 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['The restaurant is closed'],
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const tables = this.tableList.filter((t) => tableIds.includes(t.id));
    let freedAmount = 0;
    tables.forEach((t) => {
      if (t.status === 'unavailable') {
        freedAmount++;
        t.status = 'available';
      }
    });
    const availableTable = this.tableList.filter(
      (t) => t.status === 'available',
    );

    return {
      freed_table_amount: freedAmount,
      table_remaining_amount: availableTable.length,
    };
  }
}
