export type ProfileRole = 'customer' | 'admin';

export type Profile = {
  id: string;
  email: string;
  fullName: string;
  role: ProfileRole;
  createdAt: string;
};
