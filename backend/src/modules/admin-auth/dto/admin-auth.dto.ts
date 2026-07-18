export class AdminLoginDto {
  username: string;
  password: string;
}

export class AdminForgotRequestDto {
  username: string;
}

export class AdminResetDto {
  username: string;
  otp: string;
  newUsername?: string;
  newPassword?: string;
}
