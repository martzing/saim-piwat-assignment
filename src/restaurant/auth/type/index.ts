export type Staff = {
  id: number;
  username: string;
  password: string;
  canInit: boolean;
};

export type LoginData = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};
