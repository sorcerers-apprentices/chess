export type User = {
  email: string;
  displayName: string;
  phone: string;
  winedGames: number;
  playedGames: number;
};

export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = SignInCredentials & {
  displayName: string;
  phone: string;
};
