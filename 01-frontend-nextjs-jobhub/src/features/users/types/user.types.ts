export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  phone?: string;
}
