import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Scissors, Pencil, Trash2, Save, X, Loader2 } from 'lucide-react';
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
import { partnersApi } from '@/lib/api';
import { Partner } from '@/types';
import { toast } from 'sonner';
import { formatCNPJ, formatCEP, formatPhone } from '@/lib/masks';

interface EditData {
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
  instagram: string;
  pagarme_id: string;
}

export default function PartnerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditData | null>(null);

  const loadPartner = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await partnersApi.getById(Number(id));
      setPartner(data);
      if (data) {
        setEditData({
          name: data.name,
          email: data.email,
          whatsapp: data.whatsapp,
          cnpj: data.cnpj,
          cep: data.cep,
          street: data.street,
          number: data.number,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          instagram: data.instagram || '',
          pagarme_id: data.pagarme_id || '',
        });
      }
    } catch (error) {
      console.error('Error loading partner:', error);
      toast.error('Erro ao carregar parceiro');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPartner();
  }, [id]);

  const handleEdit = () => {
    if (partner) {
      setEditData({
        name: partner.name,
        email: partner.email,
        whatsapp: partner.whatsapp,
        cnpj: partner.cnpj,
        cep: partner.cep,
        street: partner.street,
        number: partner.number,
        neighborhood: partner.neighborhood,
        city: partner.city,
        state: partner.state,
        instagram: partner.instagram || '',
        pagarme_id: partner.pagarme_id || '',
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    if (partner) {
      setEditData({
        name: partner.name,
        email: partner.email,
        whatsapp: partner.whatsapp,
        cnpj: partner.cnpj,
        cep: partner.cep,
        street: partner.street,
        number: partner.number,
        neighborhood: partner.neighborhood,
        city: partner.city,
        state: partner.state,
        pagarme_id: partner.pagarme_id || '',
      });
    }
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editData || !id) return;

    try {
      setIsSaving(true);
      await partnersApi.update(Number(id), {
        name: editData.name,
        email: editData.email,
        ...(editData.pagarme_id ? { pagarme_id: editData.pagarme_id } : {}),
        metadata: {
          cnpj: editData.cnpj,
          whatsapp: editData.whatsapp,
          cep: editData.cep,
          rua: editData.street,
          numero: editData.number,
          bairro: editData.neighborhood,
          cidade: editData.city,
          estado: editData.state,
        },
      });
      await loadPartner();
      setIsEditing(false);
      toast.success('Parceiro atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating partner:', error);
      toast.error('Erro ao atualizar parceiro');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await partnersApi.delete(Number(id));
      toast.success('Parceiro excluído com sucesso!');
      navigate('/partners');
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Erro ao excluir parceiro');
    }
  };

  const handleChange = (field: keyof EditData, value: string) => {
    if (editData) {
      let masked = value;
      if (field === 'cnpj') masked = formatCNPJ(value);
      if (field === 'whatsapp') masked = formatPhone(value);
      if (field === 'cep') masked = formatCEP(value);
      setEditData({ ...editData, [field]: masked });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
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
                    <Label>WhatsApp</Label>
                    <Input
                      value={editData?.whatsapp || ''}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
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
                  <div className="space-y-2 md:col-span-2">
                    <Label>Pagar.me ID (opcional)</Label>
                    <Input
                      value={editData?.pagarme_id || ''}
                      onChange={(e) => handleChange('pagarme_id', e.target.value)}
                      placeholder="rcv_xxxxxxxxxxxxxxxxxx"
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
                        <p className="text-sm text-muted-foreground">WhatsApp</p>
                        <p className="font-medium">{partner.whatsapp}</p>
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
                Serviços do Parceiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              {partner.services.length === 0 ? (
                <div className="text-center py-8">
                  <Scissors className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum serviço cadastrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {partner.services.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <Badge variant={service.isActive ? 'default' : 'secondary'}>
                          {service.isActive ? 'Ativo' : 'Inativo'}
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
                <span className="text-muted-foreground">Cadastrado em</span>
                <span className="font-semibold">
                  {new Date(partner.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={partner.confirmed ? 'default' : 'secondary'}>
                  {partner.confirmed ? 'Confirmado' : 'Pendente'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Serviços</span>
                <span className="font-semibold">{partner.services.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
