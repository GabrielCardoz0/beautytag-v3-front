import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PartnerModal } from '@/components/PartnerModal';
import { partnersApi } from '@/lib/api';
import { Partner } from '@/types';
import { toast } from 'sonner';

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      const data = await partnersApi.list();
      setPartners(data);
    } catch (error) {
      console.error('Error loading partners:', error);
      toast.error('Erro ao carregar parceiros');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const handleSavePartner = async (partnerData: {
    name: string;
    email: string;
    metadata: {
      cnpj: string;
      whatsapp: string;
      cep: string;
      rua: string;
      numero: string;
      bairro: string;
      cidade: string;
      estado: string;
    };
  }) => {
    try {
      await partnersApi.create(partnerData);
      await loadPartners();
      toast.success('Parceiro cadastrado com sucesso!');
    } catch (error) {
      console.error('Error creating partner:', error);
      toast.error('Erro ao cadastrar parceiro');
    }
  };

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.cnpj.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-foreground">Parceiros</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Parceiro
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {filteredPartners.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum parceiro encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? 'Tente ajustar sua busca' : 'Comece cadastrando seu primeiro parceiro'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Parceiro
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3 max-w-3xl">
          {filteredPartners.map(partner => (
            <Card
              key={partner.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate(`/partners/${partner.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-2xl">
                      {partner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-lg">{partner.name}</h3>
                    <p className="text-sm text-muted-foreground">{partner.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-foreground">{partner.whatsapp}</p>
                    <p className="text-xs text-muted-foreground">{partner.cnpj}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PartnerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSavePartner}
      />
    </div>
  );
}
