import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { formatPhone, formatCNPJ, formatCEP } from '@/lib/masks';

interface PartnerFormData {
  name: string;
  email: string;
  whatsapp: string;
  cnpj: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  instagram: string;
}

const initialFormData: PartnerFormData = {
  name: '', email: '', whatsapp: '', cnpj: '',
  cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '', instagram: '',
};

interface PartnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (partner: {
    name: string;
    email: string;
    metadata: Record<string, any>;
  }) => void;
}


export function PartnerModal({ open, onOpenChange, onSave }: PartnerModalProps) {
  const [formData, setFormData] = useState<PartnerFormData>(initialFormData);

  const handleChange = (field: keyof PartnerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.whatsapp || !formData.cnpj) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    onSave({
      name: formData.name,
      email: formData.email,
      metadata: {
        cnpj: formData.cnpj,
        whatsapp: formData.whatsapp,
        cep: formData.cep,
        rua: formData.rua,
        numero: formData.numero,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
      },
    });

    setFormData(initialFormData);
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) setFormData(initialFormData);
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Parceiro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="Gabriel Silva Cardozo" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="gabriel@email.com" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp *</Label>
              <Input value={formData.whatsapp} onChange={e => handleChange('whatsapp', formatPhone(e.target.value))} placeholder="(11)99470-3376" />
            </div>
            <div className="space-y-2">
              <Label>CNPJ *</Label>
              <Input value={formData.cnpj} onChange={e => handleChange('cnpj', formatCNPJ(e.target.value))} placeholder="12.345.678/0001-34" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input value={formData.cep} onChange={e => handleChange('cep', formatCEP(e.target.value))} placeholder="06700-499" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Rua</Label>
              <Input value={formData.rua} onChange={e => handleChange('rua', e.target.value)} placeholder="Rua Cabrália" />
            </div>
            <div className="space-y-2">
              <Label>Número</Label>
              <Input value={formData.numero} onChange={e => handleChange('numero', e.target.value)} placeholder="135" />
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input value={formData.bairro} onChange={e => handleChange('bairro', e.target.value)} placeholder="Jardim Araruama" />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={formData.cidade} onChange={e => handleChange('cidade', e.target.value)} placeholder="Cotia" />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input value={formData.estado} onChange={e => handleChange('estado', e.target.value.toUpperCase())} placeholder="SP" maxLength={2} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
          <Button type="button" onClick={handleSubmit}>Cadastrar Parceiro</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
