export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
}

export interface Permission {
  id: number;
  name: string;
  method: string;
  route: string;
  description: string | null;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
}
