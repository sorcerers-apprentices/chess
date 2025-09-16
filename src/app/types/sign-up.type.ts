export type UserType = {
  email: string;
  displayName: string;
  phone: string;
  winedGames: number;
  playedGames: number;
};

export type SignInCredentialsType = {
  email: string;
  password: string;
};

export type SignUpCredentialsType = SignInCredentialsType & {
  displayName: string;
  phone: string;
};
