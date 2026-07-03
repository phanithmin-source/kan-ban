export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterArgs {
  input: RegisterInput;
}