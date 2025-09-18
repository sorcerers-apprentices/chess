export type UserType = {
  email: string;
  displayName: string;
  phone: string;
};

export type SignInCredentialsType = {
  email: string;
  password: string;
};

export type SignUpCredentialsType = SignInCredentialsType & {
  displayName: string;
  phone: string;
};

export type SavedUserData = {
  user: {
    id: string;
    last_sign_in_at: string;
    user_metadata: {
      phone: string;
    };
  };
};
