export type Table = {
  id: number;
  name: string;
  status: 'available' | 'unavailable';
};

export type BookingTransaction = {
  id: string;
  customerName: string;
  custumerAmount: number;
  bookingTime: Date;
  tables: Table[];
  status: 'waiting' | 'cancel' | 'complete';
  trasactionTime: Date;
};

export type InitTableResponse = {
  message: string;
};

export type ReserveTableData = {
  customerName: string;
  custumerAmount: number;
  bookingTime: Date;
};

export type ReserveTableResponse = {
  booking_id: string;
  booking_table_amount: number;
  table_remaining_amount: number;
};

export type CancelReserveTableResponse = {
  freed_table_amount: number;
  table_remaining_amount: number;
};

export type UseReserveTableResponse = {
  table_id: number;
  table_name: string;
}[];

export type ClearTableResponse = {
  freed_table_amount: number;
  table_remaining_amount: number;
};
