export type UserType = {
  email: string;
  username: string;
  phone: string;
  winedGames: number;
  playedGames: number;
};

export type SignInCredentialsType = {
  email: string;
  password: string;
};

export type SignUpCredentialsType = SignInCredentialsType & {
  username: string;
  phone: string;
};
