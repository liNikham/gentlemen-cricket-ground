export interface UserProfile {
  id: string;
  mobileNumber: string;
  name: string | null;
  email: string | null;
  isProfileCompleted: boolean;
  createdAt: string;
  isAdmin?: boolean;
}

export interface AdminProfile {
  id: string;
  username: string;
  mobileNumber: string;
  createdAt: string;
  isAdmin: boolean;
}

export type Step = 'HOME' | 'PHONE' | 'OTP' | 'PROFILE' | 'DASHBOARD';
