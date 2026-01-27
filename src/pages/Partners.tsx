import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Parceiros</h1>
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
          className="pl-10 w-full md:max-w-md"
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
        <>
          {/* Desktop: Table layout */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Parceiro</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">WhatsApp</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">CNPJ</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Cidade</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPartners.map(partner => (
                  <tr 
                    key={partner.id} 
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/partners/${partner.id}`)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold text-lg">
                            {partner.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{partner.name}</p>
                          <p className="text-sm text-muted-foreground">{partner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{partner.whatsapp || '-'}</td>
                    <td className="p-4 text-muted-foreground">{partner.cnpj || '-'}</td>
                    <td className="p-4 text-muted-foreground">
                      {partner.city ? `${partner.city}${partner.state ? ` - ${partner.state}` : ''}` : '-'}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={partner.confirmed ? 'default' : 'secondary'}>
                        {partner.confirmed ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Card layout */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredPartners.map(partner => (
              <Card
                key={partner.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/partners/${partner.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-xl">
                        {partner.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground truncate">{partner.name}</p>
                        <Badge variant={partner.confirmed ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                          {partner.confirmed ? 'Confirmado' : 'Pendente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{partner.email}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {partner.whatsapp && <span>{partner.whatsapp}</span>}
                        {partner.whatsapp && partner.city && <span>•</span>}
                        {partner.city && <span>{partner.city}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <PartnerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSavePartner}
      />
    </div>
  );
}
