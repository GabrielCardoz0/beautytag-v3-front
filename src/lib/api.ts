import axios from 'axios';
import { ApiService, ApiForm, Service, Form, apiServiceToService, apiFormToForm } from '@/types';

// Configuração base do axios
const api = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('platai-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('platai-token');
      localStorage.removeItem('platai-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ============ API Services (Real) ============

// Partners API (ainda mockado)
export const partnersApi = {
  list: async () => {
    const partners = localStorage.getItem('platai-partners');
    return partners ? JSON.parse(partners) : [];
  },
  
  getById: async (id: string) => {
    const partners = await partnersApi.list();
    return partners.find((p: any) => p.id === id);
  },
  
  create: async (data: any) => {
    const partners = await partnersApi.list();
    const newPartner = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    localStorage.setItem('platai-partners', JSON.stringify([...partners, newPartner]));
    return newPartner;
  },
  
  update: async (id: string, data: any) => {
    const partners = await partnersApi.list();
    const index = partners.findIndex((p: any) => p.id === id);
    if (index > -1) {
      partners[index] = { ...partners[index], ...data };
      localStorage.setItem('platai-partners', JSON.stringify(partners));
      return partners[index];
    }
    throw new Error('Partner not found');
  },
  
  delete: async (id: string) => {
    const partners = await partnersApi.list();
    const filtered = partners.filter((p: any) => p.id !== id);
    localStorage.setItem('platai-partners', JSON.stringify(filtered));
    return true;
  },
};

// Services API (Real)
export const servicesApi = {
  list: async (): Promise<Service[]> => {
    const response = await api.get<{ services: ApiService[] }>('/services');
    return response.data.services.map(apiServiceToService);
  },
  
  getById: async (id: number): Promise<Service | undefined> => {
    const services = await servicesApi.list();
    return services.find(s => s.id === id);
  },
  
  create: async (data: {
    name: string;
    description: string;
    price: number; // em reais
    genre: string;
    spent_time: number;
  }): Promise<Service> => {
    const response = await api.post<{ service: ApiService }>('/services', {
      name: data.name,
      description: data.description,
      price: Math.round(data.price * 100), // converte reais para centavos
      genre: data.genre,
      spent_time: data.spent_time,
    });
    return apiServiceToService(response.data.service);
  },
  
  update: async (id: number, data: {
    name?: string;
    description?: string;
    price?: number; // em reais
    genre?: string;
    spent_time?: number;
    is_active?: boolean;
  }): Promise<Service> => {
    const payload: any = { ...data };
    if (data.price !== undefined) {
      payload.price = Math.round(data.price * 100); // converte reais para centavos
    }
    const response = await api.put<{ service: ApiService }>(`/services/${id}`, payload);
    return apiServiceToService(response.data.service);
  },
  
  delete: async (id: number): Promise<boolean> => {
    await api.delete(`/services/${id}`);
    return true;
  },
};

// Forms API (Real)
export const formsApi = {
  list: async (): Promise<Form[]> => {
    const response = await api.get<{ forms: ApiForm[] }>('/forms');
    return response.data.forms.map(apiFormToForm);
  },
  
  getById: async (id: number): Promise<Form | null> => {
    try {
      const response = await axios.get<{ forms: ApiForm }>(`http://localhost:4000/forms/${id}`);
      return apiFormToForm(response.data.forms);
    } catch (error) {
      console.error('Error fetching form:', error);
      return null;
    }
  },
  
  create: async (data: {
    name: string;
    description?: string;
    forms_options: Array<{
      id: number;
      secondary_options?: Array<{ id: number }>;
    }>;
  }): Promise<Form> => {
    const response = await api.post<{ form: ApiForm }>('/forms', data);
    return apiFormToForm(response.data.form);
  },
  
  update: async (id: number, data: {
    name?: string;
    description?: string;
    forms_options?: Array<{
      id: number;
      secondary_options?: Array<{ id: number }>;
    }>;
  }): Promise<Form> => {
    const response = await api.put<{ form: ApiForm }>(`/forms/${id}`, data);
    return apiFormToForm(response.data.form);
  },
  
  delete: async (id: number): Promise<boolean> => {
    await api.delete(`/forms/${id}`);
    return true;
  },
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    // Em produção: POST /auth/login retorna { token: string }
    // Mock por enquanto
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock: simula chamada real
    // const response = await api.post('/auth/login', { email, password });
    // return response.data;
    
    if (email === 'joao@example.com' && password === '123456') {
      return { token: 'mock-jwt-token-admin' };
    }
    if (email === 'maria@example.com' && password === '123456') {
      return { token: 'mock-jwt-token-partner' };
    }
    throw new Error('Credenciais inválidas');
  },
  
  logout: async () => {
    localStorage.removeItem('platai-token');
    localStorage.removeItem('platai-user');
    return true;
  },
};

// Notifications API (ainda mockado)
export const notificationsApi = {
  list: async () => {
    const notifications = localStorage.getItem('platai-notifications');
    return notifications ? JSON.parse(notifications) : [];
  },
  
  getById: async (id: number) => {
    const notifications = await notificationsApi.list();
    return notifications.find((n: any) => n.id === id);
  },
  
  create: async (data: { title: string; user_id: number }) => {
    const notifications = await notificationsApi.list();
    const newNotification = {
      ...data,
      id: notifications.length > 0 ? Math.max(...notifications.map((n: any) => n.id)) + 1 : 1,
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem('platai-notifications', JSON.stringify([...notifications, newNotification]));
    return newNotification;
  },
  
  markAsRead: async (id: number) => {
    const notifications = await notificationsApi.list();
    const index = notifications.findIndex((n: any) => n.id === id);
    if (index > -1) {
      notifications[index] = { ...notifications[index], is_read: true, updated_at: new Date().toISOString() };
      localStorage.setItem('platai-notifications', JSON.stringify(notifications));
      return notifications[index];
    }
    throw new Error('Notification not found');
  },
  
  markAllAsRead: async () => {
    const notifications = await notificationsApi.list();
    const updated = notifications.map((n: any) => ({ ...n, is_read: true, updated_at: new Date().toISOString() }));
    localStorage.setItem('platai-notifications', JSON.stringify(updated));
    return updated;
  },
  
  delete: async (id: number) => {
    const notifications = await notificationsApi.list();
    const filtered = notifications.filter((n: any) => n.id !== id);
    localStorage.setItem('platai-notifications', JSON.stringify(filtered));
    return true;
  },
};
