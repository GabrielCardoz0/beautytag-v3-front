import axios from 'axios';

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

// ============ Mock API Services ============

// Partners API
export const partnersApi = {
  list: async () => {
    // Mock: buscar do localStorage
    const partners = localStorage.getItem('platai-partners');
    return partners ? JSON.parse(partners) : [];
  },
  
  getById: async (id: string) => {
    const partners = await partnersApi.list();
    return partners.find((p: any) => p.id === id);
  },
  
  create: async (data: any) => {
    // Mock: adicionar ao localStorage
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

// Services API
export const servicesApi = {
  list: async () => {
    const services = localStorage.getItem('platai-services');
    return services ? JSON.parse(services) : [];
  },
  
  getById: async (id: string) => {
    const services = await servicesApi.list();
    return services.find((s: any) => s.id === id);
  },
  
  create: async (data: any) => {
    const services = await servicesApi.list();
    const newService = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    localStorage.setItem('platai-services', JSON.stringify([...services, newService]));
    return newService;
  },
  
  update: async (id: string, data: any) => {
    const services = await servicesApi.list();
    const index = services.findIndex((s: any) => s.id === id);
    if (index > -1) {
      services[index] = { ...services[index], ...data };
      localStorage.setItem('platai-services', JSON.stringify(services));
      return services[index];
    }
    throw new Error('Service not found');
  },
  
  delete: async (id: string) => {
    const services = await servicesApi.list();
    const filtered = services.filter((s: any) => s.id !== id);
    localStorage.setItem('platai-services', JSON.stringify(filtered));
    return true;
  },
};

// Forms API
export const formsApi = {
  list: async () => {
    const forms = localStorage.getItem('platai-forms');
    return forms ? JSON.parse(forms) : [];
  },
  
  getById: async (id: string) => {
    const forms = await formsApi.list();
    return forms.find((f: any) => f.id === id);
  },
  
  create: async (data: any) => {
    const forms = await formsApi.list();
    const newForm = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    localStorage.setItem('platai-forms', JSON.stringify([...forms, newForm]));
    return newForm;
  },
  
  update: async (id: string, data: any) => {
    const forms = await formsApi.list();
    const index = forms.findIndex((f: any) => f.id === id);
    if (index > -1) {
      forms[index] = { ...forms[index], ...data };
      localStorage.setItem('platai-forms', JSON.stringify(forms));
      return forms[index];
    }
    throw new Error('Form not found');
  },
  
  delete: async (id: string) => {
    const forms = await formsApi.list();
    const filtered = forms.filter((f: any) => f.id !== id);
    localStorage.setItem('platai-forms', JSON.stringify(filtered));
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

// Notifications API
export const notificationsApi = {
  list: async () => {
    // Mock: buscar do localStorage
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
