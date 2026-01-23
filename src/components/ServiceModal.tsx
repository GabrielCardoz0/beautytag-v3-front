import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Service } from '@/types';
import { toast } from 'sonner';

interface ServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (service: {
    name: string;
    description: string;
    price: number;
    gender: 'masculino' | 'feminino' | 'unissex';
    spentTime: number;
  }) => void;
  onUpdate?: (id: number, service: {
    name: string;
    description: string;
    price: number;
    gender: 'masculino' | 'feminino' | 'unissex';
    spentTime: number;
  }) => void;
  editingService?: Service | null;
}

export function ServiceModal({ open, onOpenChange, onSave, onUpdate, editingService }: ServiceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    spentTime: '30',
    gender: '' as 'masculino' | 'feminino' | 'unissex' | '',
  });

  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name,
        description: editingService.description,
        price: editingService.price.toString(),
        spentTime: editingService.spentTime.toString(),
        gender: editingService.gender,
      });
    } else {
      resetForm();
    }
  }, [editingService, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      spentTime: '30',
      gender: '',
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

    const serviceData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      gender: formData.gender as 'masculino' | 'feminino' | 'unissex',
      spentTime: parseInt(formData.spentTime) || 30,
    };

    if (editingService && onUpdate) {
      onUpdate(editingService.id, serviceData);
    } else {
      onSave(serviceData);
    }

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="flex justify-end gap-3 pt-4 border-t">
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
