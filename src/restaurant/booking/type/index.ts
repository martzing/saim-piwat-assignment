export type Table = {
  id: number;
  name: string;
  status: 'available' | 'unavailable';
};

export type CreateTableResponse = {
  message: string;
};
