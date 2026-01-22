export type UserRole = 'admin' | 'partner';

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  repassePercent: number;
  colaboradorPercent: number;
  gender: 'masculino' | 'feminino' | 'unissex';
  partnerId: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface FormServiceOption {
  serviceId: string;
  secondaryServiceIds: string[];
}

export interface Form {
  id: string;
  name: string;
  description: string;
  serviceOptions: FormServiceOption[];
  createdAt: string;
}
