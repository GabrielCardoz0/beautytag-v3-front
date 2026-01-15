import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Building2, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Partner, Service } from '@/types';

export default function PartnerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partners] = useLocalStorage<Partner[]>('platai-partners', []);
  const [services] = useLocalStorage<Service[]>('platai-services', []);

  const partner = partners.find(p => p.id === id);
  const partnerServices = services.filter(s => s.partnerId === id);

  if (!partner) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={() => navigate('/partners')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground">Parceiro não encontrado</h2>
          <p className="text-muted-foreground mt-2">O parceiro que você está procurando não existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Button variant="ghost" onClick={() => navigate('/partners')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Parceiros
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-3xl">
                    {partner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-2xl">{partner.name}</CardTitle>
                  <p className="text-muted-foreground">{partner.cnpj}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{partner.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{partner.phone}</p>
                  </div>
                </div>
              </div>
              
              {(partner.street || partner.city) && (
                <div className="flex items-start gap-3 pt-2 border-t">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Endereço</p>
                    <p className="font-medium">
                      {partner.street && `${partner.street}, ${partner.number}`}
                      {partner.neighborhood && ` - ${partner.neighborhood}`}
                    </p>
                    <p className="text-muted-foreground">
                      {partner.city && `${partner.city}`}
                      {partner.state && ` - ${partner.state}`}
                      {partner.cep && ` | CEP: ${partner.cep}`}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Serviços Relacionados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {partnerServices.length === 0 ? (
                <div className="text-center py-8">
                  <Scissors className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum serviço vinculado a este parceiro</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/services')}>
                    Ir para Serviços
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {partnerServices.map(service => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                    >
                      <div>
                        <h4 className="font-medium text-foreground">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          R$ {service.price.toFixed(2)}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {service.gender}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Serviços</span>
                <span className="font-semibold">{partnerServices.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cadastrado em</span>
                <span className="font-semibold">
                  {new Date(partner.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
