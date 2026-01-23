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

// Tipo da API para serviços
export interface ApiService {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  name: string;
  spent_time: number;
  description: string;
  genre: 'masculino' | 'feminino' | 'unissex';
  price: number; // em centavos (1200 = R$ 12,00)
  percent_colab: number;
  percent_repasse: number;
  preco_colab: number;
  preco_parceiro: number;
  lucro: number;
  is_active: boolean;
  is_complete: boolean;
}

// Tipo usado internamente (convertido da API)
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number; // em reais (12.00 = R$ 12,00)
  spentTime: number;
  repassePercent: number;
  colaboradorPercent: number;
  gender: 'masculino' | 'feminino' | 'unissex';
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Tipo da API para opções de formulário
export interface ApiFormOption {
  id: number;
  created_at: string;
  updated_at: string;
  service_id: number;
  form_id: number;
  options: ApiService;
  forms_options_secondary_options: ApiService[];
}

// Tipo da API para formulário
export interface ApiForm {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  forms_options: ApiFormOption[];
}

// Tipo usado internamente
export interface FormServiceOption {
  serviceId: number;
  secondaryServiceIds: number[];
}

export interface Form {
  id: number;
  name: string;
  description: string;
  serviceOptions: FormServiceOption[];
  createdAt: string;
}

export interface Notification {
  id: number;
  title: string;
  is_read: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

// Helpers para converter da API para formato interno
export function apiServiceToService(apiService: ApiService): Service {
  return {
    id: apiService.id,
    name: apiService.name,
    description: apiService.description,
    price: apiService.price / 100, // converte centavos para reais
    spentTime: apiService.spent_time,
    repassePercent: apiService.percent_repasse,
    colaboradorPercent: apiService.percent_colab,
    gender: apiService.genre,
    isActive: apiService.is_active,
    createdAt: apiService.created_at,
  };
}

export function apiFormToForm(apiForm: ApiForm): Form {
  return {
    id: apiForm.id,
    name: apiForm.name,
    description: apiForm.description || '',
    serviceOptions: apiForm.forms_options.map(opt => ({
      serviceId: opt.options.id,
      secondaryServiceIds: opt.forms_options_secondary_options.map(s => s.id),
    })),
    createdAt: apiForm.created_at,
  };
}
