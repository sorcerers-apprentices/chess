export type User = {
  email: string;
  username: string;
  phone: string;
  winedGames: number;
  playedGames: number;
};

export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = SignInCredentials & {
  username: string;
  phone: string;
};
