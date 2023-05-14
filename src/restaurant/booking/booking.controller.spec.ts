import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import dayjs from './../../utils/dayjs';

describe('BookingController', () => {
  let controller: BookingController;
  let service: BookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [BookingService],
    }).compile();

    controller = module.get<BookingController>(BookingController);
    service = module.get<BookingService>(BookingService);
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
  });

  it('init table success', () => {
    const res = controller.initTable({ amount: 2 });
    expect(res).toEqual({ message: 'Initialize table success' });
  });

  it('reserve table success', () => {
    controller.initTable({ amount: 4 });
    const res = controller.reserveTable({
      customer_name: 'Samart',
      customer_amount: 9,
      booking_time: dayjs().add(1, 'hour').toDate(),
    });
    const uuidRegExp =
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    expect(res.booking_id).toMatch(uuidRegExp);
    expect(res.booking_table_amount).toEqual(3);
    expect(res.table_remaining_amount).toEqual(1);
  });

  it('cancel reserve table success', () => {
    controller.initTable({ amount: 4 });
    const reserve = controller.reserveTable({
      customer_name: 'Samart',
      customer_amount: 9,
      booking_time: dayjs().add(1, 'hour').toDate(),
    });
    const res = controller.cancelReserveTable({
      booking_id: reserve.booking_id,
    });
    expect(res).toEqual({
      freed_table_amount: 3,
      table_remaining_amount: 4,
    });
  });

  it('use reserve table success', () => {
    controller.initTable({ amount: 4 });
    const now = dayjs();
    const reserve = controller.reserveTable({
      customer_name: 'Samart',
      customer_amount: 9,
      booking_time: now.add(1, 'hour').toDate(),
    });

    const bookingTxn = service.bookingTransactionList.find(
      (txn) => txn.id === reserve.booking_id,
    );
    bookingTxn.bookingTime = now.toDate();

    const res = controller.useReserveTable({
      booking_id: reserve.booking_id,
    });
    expect(res).toEqual([
      {
        table_id: 1,
        table_name: 'Table_1',
      },
      {
        table_id: 2,
        table_name: 'Table_2',
      },
      {
        table_id: 3,
        table_name: 'Table_3',
      },
    ]);
  });

  it('clear table success', () => {
    controller.initTable({ amount: 4 });
    const tables = service.tableList.filter((t) => [1, 2].includes(t.id));
    tables.forEach((t) => {
      t.status = 'unavailable';
    });
    const res = controller.clearTable({ table_ids: [1, 2] });
    expect(res).toEqual({
      freed_table_amount: 2,
      table_remaining_amount: 4,
    });
  });
});
