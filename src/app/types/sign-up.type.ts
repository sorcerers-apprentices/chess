export type User = {
  isAuth: boolean;
  email: string;
  username: string;
  phone: string;
  elo: number;
  gameNumber: number;
};

export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = SignInCredentials & {
  username: string;
  phone: string;
};
