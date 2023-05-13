export type Table = {
  id: number;
  name: string;
  status: 'available' | 'unavailable';
};

export type BookingTransaction = {
  id: string;
  custumerAmount: number;
  bookingTime: Date;
  tables: Table[];
  trasactionTime: Date;
};

export type InitTableResponse = {
  message: string;
};

export type ReserveTableData = {
  custumerAmount: number;
  bookingTime: Date;
};

export type ReserveTableResponse = {
  booking_id: string;
  booking_table_amount: number;
  table_remaining_amount: number;
};
