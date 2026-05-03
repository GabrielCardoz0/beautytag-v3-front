export type UserRole = 'admin' | 'partner' | 'parceiro' | 'colaborador';

// Tipo da API para metadata do parceiro
export interface ApiPartnerMetadata {
  cnpj?: string;
  whatsapp?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pagarme_id?: string;
}

// Tipo da API para parceiro (usuário com role parceiro)
export interface ApiPartner {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  role: 'parceiro';
  metadata: ApiPartnerMetadata | null;
  services: ApiService[];
}

// Tipo usado internamente para parceiro
export interface Partner {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  cnpj: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  pagarme_id: string;
  confirmed: boolean;
  blocked: boolean;
  services: Service[];
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

export interface UserMetadata {
  cnpj?: string;
  cpf?: string;
  empresa?: string;
  birthday?: string;
  genre?: string;
  whatsapp?: string;
  cep?: string;
  [key: string]: string | undefined;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  metadata: UserMetadata | null;
  confirmed?: boolean;
  blocked?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Tipo da API para opção secundária
export interface ApiFormSecondaryOption {
  id: number;
  created_at: string;
  updated_at: string;
  form_option_id: number;
  service_id: number;
  options: ApiService;
}

// Tipo da API para opções de formulário
export interface ApiFormOption {
  id: number;
  created_at: string;
  updated_at: string;
  service_id: number;
  form_id: number;
  options: ApiService;
  forms_options_secondary_options: ApiFormSecondaryOption[];
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

// Tipo usado internamente para opções secundárias
export interface FormSecondaryOption {
  id: number; // ID da opção secundária (para deletar)
  serviceId: number;
}

// Tipo usado internamente
export interface FormServiceOption {
  optionId: number; // ID da opção no formulário (para deletar)
  serviceId: number;
  secondaryOptions: FormSecondaryOption[];
}

export interface Form {
  id: number;
  name: string;
  description: string;
  serviceOptions: FormServiceOption[];
  createdAt: string;
}

// Tipo da API para serviço vinculado ao agendamento
export interface ApiAppointmentService {
  id: number;
  created_at: string;
  updated_at: string;
  appointment_id: number;
  service_id: number;
  services: ApiService;
}

// Tipo da API para agendamento
export interface ApiAppointment {
  id: number;
  created_at: string;
  updated_at: string;
  start_at: string;
  end_at: string;
  status: string;
  notes: string | null;
  client_name: string;
  client_phone: string;
  user_id: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    metadata: Record<string, string> | null;
  } | null;
  appointments_services: ApiAppointmentService[];
}

// Tipo interno para agendamento
export interface AppointmentData {
  id: number;
  clientName: string;
  clientPhone: string;
  startAt: Date;
  endAt: Date;
  status: string;
  notes: string | null;
  services: ApiService[];
}

export function apiAppointmentToAppointment(api: ApiAppointment): AppointmentData {
  return {
    id: api.id,
    clientName: api.client_name,
    clientPhone: api.client_phone,
    startAt: new Date(api.start_at),
    endAt: new Date(api.end_at),
    status: api.status,
    notes: api.notes,
    services: api.appointments_services?.map(as => as.services),
  };
}

export interface Notification {
  id: number;
  title: string;
  is_read: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

// Tipo da API para serviço do plano
export interface ApiPlanService {
  id: number;
  created_at: string;
  updated_at: string;
  frequency: string;
  plan_id: number;
  service_id: number;
  service: ApiService;
}

// Tipo da API para plano
export interface ApiPlan {
  id: number;
  created_at: string;
  updated_at: string;
  status: string;
  user_id: number;
  users: {
    id: number;
    created_at: string;
    updated_at: string;
    name: string;
    email: string;
    confirmed: boolean;
    blocked: boolean;
    role: string;
    metadata: Record<string, string> | null;
  };
  plan_services: ApiPlanService[];
}

// Tipo interno para serviço do plano
export interface PlanService {
  id: number;
  serviceId: number;
  serviceName: string;
  price: number; // em reais
  frequency: string;
  spentTime: number;
}

// Tipo interno para plano
export interface Plan {
  id: number;
  status: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userCpf: string;
  userCompany: string;
  userGenre: string;
  userBirthday: string;
  planServices: PlanService[];
  totalValue: number;
  createdAt: string;
}

export function apiPlanToPlan(api: ApiPlan): Plan {
  const planServices: PlanService[] = api.plan_services.map(ps => ({
    id: ps.id,
    serviceId: ps.service_id,
    serviceName: ps.service.name,
    price: ps.service.price / 100,
    frequency: ps.frequency,
    spentTime: ps.service.spent_time,
  }));

  const frequencyMultiplier = (freq: string): number => {
    const match = freq.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  const totalValue = planServices.reduce((sum, ps) => {
    return sum + ps.price * frequencyMultiplier(ps.frequency);
  }, 0);

  return {
    id: api.id,
    status: api.status,
    userName: api.users.name,
    userEmail: api.users.email,
    userPhone: api.users.metadata?.whatsapp || '',
    userCpf: api.users.metadata?.cpf || '',
    userCompany: api.users.metadata?.empresa || '',
    userGenre: api.users.metadata?.genre || '',
    userBirthday: api.users.metadata?.birthday || '',
    planServices,
    totalValue,
    createdAt: api.created_at,
  };
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
    id: apiForm?.id,
    name: apiForm?.name,
    description: apiForm?.description || '',
    serviceOptions: apiForm?.forms_options?.map(opt => ({
      optionId: opt?.id,
      serviceId: opt?.options?.id,
      secondaryOptions: opt?.forms_options_secondary_options?.map(sec => ({
        id: sec?.id,
        serviceId: sec?.options?.id,
      })) || [],
    })) || [],
    createdAt: apiForm?.created_at,
  };
}

export function apiPartnerToPartner(apiPartner: ApiPartner): Partner {
  return {
    id: apiPartner?.id,
    name: apiPartner?.name,
    email: apiPartner?.email,
    whatsapp: apiPartner?.metadata?.whatsapp || '',
    cnpj: apiPartner?.metadata?.cnpj || '',
    cep: apiPartner?.metadata?.cep || '',
    street: apiPartner?.metadata?.rua || '',
    number: apiPartner?.metadata?.numero || '',
    neighborhood: apiPartner?.metadata?.bairro || '',
    city: apiPartner?.metadata?.cidade || '',
    state: apiPartner?.metadata?.estado || '',
    pagarme_id: apiPartner?.metadata?.pagarme_id || '',
    confirmed: apiPartner?.confirmed,
    blocked: apiPartner?.blocked,
    services: apiPartner?.services?.map(apiServiceToService),
    createdAt: apiPartner?.created_at,
  };
}
