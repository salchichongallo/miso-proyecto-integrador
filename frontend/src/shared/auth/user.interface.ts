export interface User {
  id: string;
  email: string;
  role: Role;
}

export enum Role {
  admin = 'admin',
  client = 'client',
  vendor = 'vendor',
  provider = 'provider',
}
