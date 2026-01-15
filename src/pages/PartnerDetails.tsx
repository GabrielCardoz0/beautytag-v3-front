import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Scissors, Pencil, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Partner, Service } from '@/types';
import { toast } from 'sonner';

export default function PartnerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partners, setPartners] = useLocalStorage<Partner[]>('platai-partners', []);
  const [services] = useLocalStorage<Service[]>('platai-services', []);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partner | null>(null);

  const partner = partners.find(p => p.id === id);
  const partnerServices = services.filter(s => s.partnerId === id);

  useEffect(() => {
    if (partner && !editData) {
      setEditData({ ...partner });
    }
  }, [partner]);

  const handleEdit = () => {
    if (partner) {
      setEditData({ ...partner });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setEditData(partner ? { ...partner } : null);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!editData || !id) return;

    setPartners(prev => prev.map(p => p.id === id ? editData : p));
    setIsEditing(false);
    toast.success('Parceiro atualizado com sucesso!');
  };

  const handleDelete = () => {
    if (!id) return;
    
    setPartners(prev => prev.filter(p => p.id !== id));
    toast.success('Parceiro excluído com sucesso!');
    navigate('/partners');
  };

  const handleChange = (field: keyof Partner, value: string) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

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
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/partners')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Parceiros
        </Button>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o parceiro "{partner.name}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-3xl">
                    {(isEditing ? editData?.name : partner.name)?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editData?.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="text-xl font-bold"
                        placeholder="Nome do Parceiro"
                      />
                      <Input
                        value={editData?.cnpj || ''}
                        onChange={(e) => handleChange('cnpj', e.target.value)}
                        placeholder="CNPJ"
                      />
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-2xl">{partner.name}</CardTitle>
                      <p className="text-muted-foreground">{partner.cnpj}</p>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={editData?.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={editData?.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input
                      value={editData?.cep || ''}
                      onChange={(e) => handleChange('cep', e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rua</Label>
                    <Input
                      value={editData?.street || ''}
                      onChange={(e) => handleChange('street', e.target.value)}
                      placeholder="Nome da rua"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input
                      value={editData?.number || ''}
                      onChange={(e) => handleChange('number', e.target.value)}
                      placeholder="123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bairro</Label>
                    <Input
                      value={editData?.neighborhood || ''}
                      onChange={(e) => handleChange('neighborhood', e.target.value)}
                      placeholder="Bairro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input
                      value={editData?.city || ''}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="Cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input
                      value={editData?.state || ''}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="UF"
                      maxLength={2}
                    />
                  </div>
                </div>
              ) : (
                <>
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
                </>
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
