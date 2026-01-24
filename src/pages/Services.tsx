import { useState, useEffect } from 'react';
import { Plus, Search, Scissors, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServiceModal } from '@/components/ServiceModal';
import { ServiceDetailsModal } from '@/components/ServiceDetailsModal';
import { Service } from '@/types';
import { servicesApi } from '@/lib/api';
import { toast } from 'sonner';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await servicesApi.list();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async (serviceData: {
    name: string;
    description: string;
    price: number;
    gender: 'masculino' | 'feminino' | 'unissex';
    spentTime: number;
  }) => {
    try {
      await servicesApi.create({
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        genre: serviceData.gender,
        spent_time: serviceData.spentTime,
      });
      toast.success('Serviço cadastrado com sucesso!');
      loadServices();
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Erro ao cadastrar serviço');
    }
  };

  const handleUpdateService = async (id: number, serviceData: {
    name: string;
    description: string;
    price: number;
    gender: 'masculino' | 'feminino' | 'unissex';
    spentTime: number;
  }) => {
    try {
      await servicesApi.update(id, {
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        genre: serviceData.gender,
        spent_time: serviceData.spentTime,
      });
      toast.success('Serviço atualizado com sucesso!');
      setEditingService(null);
      loadServices();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Erro ao atualizar serviço');
    }
  };

  const handleDeleteService = async (id: number) => {
    try {
      await servicesApi.delete(id);
      setIsDetailsOpen(false);
      setSelectedService(null);
      toast.success('Serviço excluído com sucesso!');
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Erro ao excluir serviço');
    }
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsDetailsOpen(true);
  };

  const handleEditFromDetails = () => {
    setIsDetailsOpen(false);
    setEditingService(selectedService);
    setIsModalOpen(true);
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'masculino': return 'bg-blue-100 text-blue-800';
      case 'feminino': return 'bg-pink-100 text-pink-800';
      case 'unissex': return 'bg-purple-100 text-purple-800';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
        <Button onClick={() => { setEditingService(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {filteredServices.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scissors className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum serviço encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? 'Tente ajustar sua busca' : 'Comece cadastrando seu primeiro serviço'}
            </p>
            {!searchTerm && (
              <Button onClick={() => { setEditingService(null); setIsModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Serviço
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3 max-w-3xl">
          {filteredServices.map(service => (
            <Card 
              key={service.id} 
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => handleServiceClick(service)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Scissors className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{service.name}</h3>
                        <Badge className={getGenderColor(service.gender)}>
                          {service.gender}
                        </Badge>
                      </div>
                      {service.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {service.description}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">{service.spentTime} min</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Repasse: {service.repassePercent}%</p>
                      <p>Colaborador: {service.colaboradorPercent}%</p>
                    </div>
                    <span className="text-2xl font-bold text-foreground whitespace-nowrap">
                      R$ {service.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ServiceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveService}
        onUpdate={handleUpdateService}
        editingService={editingService}
      />

      <ServiceDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        service={selectedService}
        onEdit={handleEditFromDetails}
        onDelete={() => selectedService && handleDeleteService(selectedService.id)}
      />
    </div>
  );
}
