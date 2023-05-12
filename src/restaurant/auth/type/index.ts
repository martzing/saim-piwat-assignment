export type Admin = {
  id: number;
  username: string;
  password: string;
};

export type LoginData = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};
