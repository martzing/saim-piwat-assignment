import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { HttpStatus } from '@nestjs/common';
import dayjs from './../../utils/dayjs';

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingService],
    }).compile();

    service = module.get<BookingService>(BookingService);
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
  });

  it('init table success', () => {
    const res = service.initTable(2);
    expect(service.tableList).toEqual([
      {
        id: 1,
        name: 'Table_1',
        status: 'available',
      },
      {
        id: 2,
        name: 'Table_2',
        status: 'available',
      },
    ]);
    expect(res).toEqual({ message: 'Initialize table success' });
  });

  it('init table fail when call more than one', () => {
    service.initTable(2);
    let thrownError;
    try {
      service.initTable(2);
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.CONFLICT,
      message: ['Table already initialize'],
      error: 'Conflict',
    });
  });

  it('reserve table success', () => {
    service.initTable(2);
    const now = dayjs();
    const bookingTime = now.add(1, 'hour');
    const res = service.reserveTable({
      customerName: 'Samart',
      custumerAmount: 6,
      bookingTime: bookingTime.toDate(),
    });
    const uuidRegExp =
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    expect(res.booking_id).toMatch(uuidRegExp);
    expect(res.booking_table_amount).toEqual(2);
    expect(res.table_remaining_amount).toEqual(0);
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      bookingTime.add(30, 'minute').diff(now, 'millisecond'),
    );
  });

  it('reserve table fail when table not init', () => {
    let thrownError;
    try {
      service.reserveTable({
        customerName: 'Samart',
        custumerAmount: 6,
        bookingTime: dayjs().add(1, 'hour').toDate(),
      });
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['The restaurant is closed, please come back again'],
      error: 'Bad Request',
    });
  });

  it('reserve table fail when not reserv before 30 minute', () => {
    service.initTable(2);
    let thrownError;
    try {
      service.reserveTable({
        customerName: 'Samart',
        custumerAmount: 6,
        bookingTime: dayjs().add(15, 'minute').toDate(),
      });
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['Please make a reservation 30 minutes in advance'],
      error: 'Bad Request',
    });
  });

  it('reserve table fail when table not enough', () => {
    service.initTable(2);
    let thrownError;
    try {
      service.reserveTable({
        customerName: 'Samart',
        custumerAmount: 10,
        bookingTime: dayjs().add(1, 'hour').toDate(),
      });
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['Table amount not enough'],
      error: 'Bad Request',
    });
  });

  it('cancel reserve table success', () => {
    service.initTable(2);
    const now = dayjs();
    const bookingTime = now.add(1, 'hour');
    const reserve = service.reserveTable({
      customerName: 'Samart',
      custumerAmount: 6,
      bookingTime: bookingTime.toDate(),
    });

    const res = service.cancelReserveTable(reserve.booking_id);
    expect(res).toEqual({
      freed_table_amount: 2,
      table_remaining_amount: 2,
    });
  });

  it('cancel reserve table fail when table not init', () => {
    let thrownError;
    try {
      service.cancelReserveTable('b4382af2-5e43-40d4-928c-4611aa70d579');
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['Cannot cancel booking because the restaurant is closed'],
      error: 'Bad Request',
    });
  });

  it('cancel reserve table fail when booking not found', () => {
    service.initTable(2);
    const now = dayjs();
    const bookingTime = now.add(1, 'hour');
    service.reserveTable({
      customerName: 'Samart',
      custumerAmount: 6,
      bookingTime: bookingTime.toDate(),
    });
    let thrownError;
    try {
      service.cancelReserveTable('b4382af2-5e43-40d4-928c-4611aa70d579');
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.NOT_FOUND,
      message: ['Booking id not found'],
      error: 'Not Found',
    });
  });

  it('cancel reserve table fail when booking status !== waiting', () => {
    service.initTable(2);
    const now = dayjs();
    const bookingTime = now.add(1, 'hour');
    const reserve = service.reserveTable({
      customerName: 'Samart',
      custumerAmount: 6,
      bookingTime: bookingTime.toDate(),
    });

    const bookingTxn = service.bookingTransactionList.find(
      (txn) => txn.id === reserve.booking_id,
    );
    bookingTxn.status = 'complete';

    let thrownError;
    try {
      service.cancelReserveTable(reserve.booking_id);
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['Booking status cannot cancel'],
      error: 'Bad Request',
    });
  });

  it('use reserve table success', () => {
    service.initTable(2);
    const now = dayjs();
    const bookingTime = now.add(1, 'hour');
    const reserve = service.reserveTable({
      customerName: 'Samart',
      custumerAmount: 6,
      bookingTime: bookingTime.toDate(),
    });

    const bookingTxn = service.bookingTransactionList.find(
      (txn) => txn.id === reserve.booking_id,
    );
    bookingTxn.bookingTime = now.toDate();

    const res = service.useReserveTable(reserve.booking_id);
    expect(bookingTxn.status).toEqual('complete');
    expect(res).toEqual([
      {
        table_id: 1,
        table_name: 'Table_1',
      },
      {
        table_id: 2,
        table_name: 'Table_2',
      },
    ]);
  });

  it('use reserve table fail when not init table', () => {
    let thrownError;
    try {
      service.useReserveTable('b4382af2-5e43-40d4-928c-4611aa70d579');
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['The restaurant is closed, please come back again'],
      error: 'Bad Request',
    });
  });

  it('use reserve table fail when booking id not found', () => {
    service.initTable(2);
    let thrownError;
    try {
      service.useReserveTable('b4382af2-5e43-40d4-928c-4611aa70d579');
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.NOT_FOUND,
      message: ['Booking id not found'],
      error: 'Not Found',
    });
  });

  it('use reserve table fail when booking status!== waiting', () => {
    service.initTable(2);
    const now = dayjs();
    const bookingTime = now.add(1, 'hour');
    const reserve = service.reserveTable({
      customerName: 'Samart',
      custumerAmount: 6,
      bookingTime: bookingTime.toDate(),
    });

    const bookingTxn = service.bookingTransactionList.find(
      (txn) => txn.id === reserve.booking_id,
    );
    bookingTxn.status = 'complete';

    let thrownError;
    try {
      service.useReserveTable(reserve.booking_id);
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['Booking status cannot set to complete'],
      error: 'Bad Request',
    });
  });

  it('use reserve table fail when customer came before booking time', () => {
    service.initTable(2);
    const now = dayjs();
    const bookingTime = now.add(1, 'hour');
    const reserve = service.reserveTable({
      customerName: 'Samart',
      custumerAmount: 6,
      bookingTime: bookingTime.toDate(),
    });

    let thrownError;
    try {
      service.useReserveTable(reserve.booking_id);
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['Sorry, You came too early'],
      error: 'Bad Request',
    });
  });

  it('use reserve table fail when customer came after booking time 30 minute', () => {
    service.initTable(2);
    const now = dayjs();
    const bookingTime = now.add(1, 'hour');
    const reserve = service.reserveTable({
      customerName: 'Samart',
      custumerAmount: 6,
      bookingTime: bookingTime.toDate(),
    });

    const bookingTxn = service.bookingTransactionList.find(
      (txn) => txn.id === reserve.booking_id,
    );
    bookingTxn.bookingTime = bookingTime.subtract(91, 'minute').toDate();

    let thrownError;
    try {
      service.useReserveTable(reserve.booking_id);
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['Sorry, You came too late'],
      error: 'Bad Request',
    });
  });

  it('clear table success', () => {
    service.initTable(2);
    service.tableList.forEach((t) => {
      t.status = 'unavailable';
    });
    const res = service.clearTable([1, 2]);
    expect(res).toEqual({
      freed_table_amount: 2,
      table_remaining_amount: 2,
    });
  });

  it('clear table fail when table not init', () => {
    let thrownError;
    try {
      service.clearTable([1, 2]);
    } catch (err) {
      thrownError = err;
    }
    expect(thrownError.getResponse()).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['The restaurant is closed'],
      error: 'Bad Request',
    });
  });
});
