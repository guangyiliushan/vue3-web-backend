export interface User {
  id: string;
  email: string;
  password: string;
  salt: string;
  username?: string;
  createdAt: Date;
}
