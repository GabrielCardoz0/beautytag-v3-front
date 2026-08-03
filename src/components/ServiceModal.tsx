import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Service, Partner } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { partnersApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ServicePayload {
  name: string;
  description: string;
  price: number;
  gender: 'masculino' | 'feminino' | 'unissex';
  spentTime: number;
  user_id?: number;
  percent_tax?: number;
  lucro?: number;
}

interface ServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (service: ServicePayload) => void;
  onUpdate?: (id: number, service: Omit<ServicePayload, 'user_id'>) => void;
  editingService?: Service | null;
}

export function ServiceModal({ open, onOpenChange, onSave, onUpdate, editingService }: ServiceModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    spentTime: '30',
    gender: '' as 'masculino' | 'feminino' | 'unissex' | '',
    user_id: '',
    percent_tax: '0',
  });

  const price = parseFloat(formData.price) || 0;
  const percentTax = parseFloat(formData.percent_tax) || 0;
  const profit = price * (percentTax / 100);

  useEffect(() => {
    if (open && isAdmin && !editingService) {
      loadPartners();
    }
  }, [open, isAdmin, editingService]);

  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name,
        description: editingService.description,
        price: editingService.price.toString(),
        spentTime: editingService.spentTime.toString(),
        gender: editingService.gender,
        user_id: '',
        percent_tax: editingService.percentTax?.toString() || '0',
      });
    } else {
      resetForm();
    }
  }, [editingService, open]);

  const loadPartners = async () => {
    try {
      setLoadingPartners(true);
      const data = await partnersApi.list();
      setPartners(data);
    } catch (error) {
      console.error('Error loading partners:', error);
      toast.error('Erro ao carregar parceiros');
    } finally {
      setLoadingPartners(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      spentTime: '30',
      gender: '',
      user_id: '',
      percent_tax: '0',
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.gender) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (isAdmin && !editingService && !formData.user_id) {
      toast.error('Selecione um parceiro');
      return;
    }

    const baseServiceData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      gender: formData.gender as 'masculino' | 'feminino' | 'unissex',
      spentTime: parseInt(formData.spentTime) || 30,
    };

    if (editingService && onUpdate) {
      if (isAdmin) {
        onUpdate(editingService.id, {
          ...baseServiceData,
          percent_tax: percentTax,
          lucro: profit,
        });
      } else {
        onUpdate(editingService.id, baseServiceData);
      }
    } else {
      if (isAdmin) {
        onSave({
          ...baseServiceData,
          user_id: parseInt(formData.user_id),
          percent_tax: percentTax,
          lucro: profit,
        });
      } else {
        onSave(baseServiceData);
      }
    }

    resetForm();
    onOpenChange(false);
  };

  const showFinancialPanel = isAdmin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={showFinancialPanel ? "max-w-4xl max-h-[90vh] overflow-y-auto" : "max-w-lg max-h-[90vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle>{editingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className={showFinancialPanel ? "md:flex md:gap-6" : ""}>
            <div className={showFinancialPanel ? "flex-1 space-y-4" : "space-y-4"}>
              {isAdmin && !editingService && (
                <div className="space-y-2">
                  <Label htmlFor="partner">Parceiro *</Label>
                  {loadingPartners ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando parceiros...
                    </div>
                  ) : (
                    <Select value={formData.user_id} onValueChange={(value) => handleChange('user_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o parceiro" />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map(partner => (
                          <SelectItem key={partner.id} value={partner.id.toString()}>
                            {partner.name} - {partner.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="serviceName">Nome *</Label>
                <Input
                  id="serviceName"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Corte Masculino"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descrição do serviço..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="120,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spentTime">Duração (min) *</Label>
                  <Input
                    id="spentTime"
                    type="number"
                    min="1"
                    value={formData.spentTime}
                    onChange={(e) => handleChange('spentTime', e.target.value)}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gênero *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="unissex">Unissex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showFinancialPanel && (
              <div className="md:w-72 md:border-l md:pl-6 mt-6 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Configurações Financeiras</h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="percent_tax">% Taxa</Label>
                    <Input
                      id="percent_tax"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.percent_tax}
                      onChange={(e) => handleChange('percent_tax', e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Valores Calculados</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-primary/10 rounded">
                        <span className="text-sm font-medium text-primary">Lucro</span>
                        <span className="font-bold text-primary">R$ {formatCurrency(profit)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
