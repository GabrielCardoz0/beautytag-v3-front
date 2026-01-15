import { useState } from 'react';
import { Plus, Search, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServiceModal } from '@/components/ServiceModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Service, Partner } from '@/types';

export default function Services() {
  const [services, setServices] = useLocalStorage<Service[]>('platai-services', []);
  const [partners] = useLocalStorage<Partner[]>('platai-partners', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSaveService = (serviceData: Omit<Service, 'id' | 'createdAt'>) => {
    const newService: Service = {
      ...serviceData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setServices(prev => [...prev, newService]);
  };

  const getPartnerName = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    return partner?.name || 'Parceiro não encontrado';
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

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
        <Button onClick={() => setIsModalOpen(true)}>
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
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Serviço
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map(service => (
            <Card key={service.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Scissors className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{getPartnerName(service.partnerId)}</p>
                    </div>
                  </div>
                  <Badge className={getGenderColor(service.gender)}>
                    {service.gender}
                  </Badge>
                </div>
                
                {service.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {service.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-2xl font-bold text-foreground">
                    R$ {service.price.toFixed(2)}
                  </span>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>Repasse: {service.repassePercent}%</p>
                    <p>Colaborador: {service.colaboradorPercent}%</p>
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
        partners={partners}
      />
    </div>
  );
}
