export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";

export interface Company {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  size: CompanySize | null;
  createdBy: number;
  createdAt: string;
}

export interface CreateCompanyPayload {
  name: string;
  logoUrl?: string;
  description?: string;
  size?: CompanySize;
}

export interface UpdateCompanyPayload {
  name?: string;
  logoUrl?: string;
  description?: string;
  size?: CompanySize;
}
