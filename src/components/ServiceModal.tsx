import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Service, Partner } from '@/types';
import { toast } from 'sonner';

interface ServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (service: Omit<Service, 'id' | 'createdAt'>) => void;
  partners: Partner[];
}

export function ServiceModal({ open, onOpenChange, onSave, partners }: ServiceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    repassePercent: '',
    colaboradorPercent: '',
    gender: '' as 'masculino' | 'feminino' | 'unissex' | '',
    partnerId: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculations = useMemo(() => {
    const price = parseFloat(formData.price) || 0;
    const repasse = parseFloat(formData.repassePercent) || 0;
    const colaborador = parseFloat(formData.colaboradorPercent) || 0;

    const precoColaborador = price * (colaborador / 100);
    const precoParceiro = price * (repasse / 100);
    const lucro = price - precoColaborador - precoParceiro;

    return {
      precoColaborador: precoColaborador.toFixed(2),
      precoParceiro: precoParceiro.toFixed(2),
      lucro: lucro.toFixed(2),
    };
  }, [formData.price, formData.repassePercent, formData.colaboradorPercent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.gender || !formData.partnerId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    onSave({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      repassePercent: parseFloat(formData.repassePercent) || 0,
      colaboradorPercent: parseFloat(formData.colaboradorPercent) || 0,
      gender: formData.gender as 'masculino' | 'feminino' | 'unissex',
      partnerId: formData.partnerId,
    });

    setFormData({
      name: '',
      description: '',
      price: '',
      repassePercent: '',
      colaboradorPercent: '',
      gender: '',
      partnerId: '',
    });
    onOpenChange(false);
    toast.success('Serviço cadastrado com sucesso!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Serviço</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="120.00"
                />
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

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repasse">Repasse (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="repasse"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.repassePercent}
                    onChange={(e) => handleChange('repassePercent', e.target.value)}
                    placeholder="40"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colaborador">Colaborador (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="colaborador"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.colaboradorPercent}
                    onChange={(e) => handleChange('colaboradorPercent', e.target.value)}
                    placeholder="30"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner">Parceiro *</Label>
                <Select value={formData.partnerId} onValueChange={(value) => handleChange('partnerId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um parceiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.length === 0 ? (
                      <SelectItem value="_none" disabled>
                        Nenhum parceiro cadastrado
                      </SelectItem>
                    ) : (
                      partners.map(partner => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2 mt-4">
                <h4 className="font-medium text-sm text-foreground">Cálculo Automático</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço para Colaborador:</span>
                  <span className="font-medium">R$ {calculations.precoColaborador}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço para Parceiro:</span>
                  <span className="font-medium">R$ {calculations.precoParceiro}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Lucro:</span>
                  <span className="font-semibold text-green-600">R$ {calculations.lucro}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Cadastrar Serviço</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
