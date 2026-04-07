import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PartnerFormData {
  // Básico
  name: string;
  email: string;
  whatsapp: string;
  cnpj: string;
  // Empresa
  company_name: string;
  trading_name: string;
  annual_revenue: string;
  // Endereço
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  // Banco
  holder_name: string;
  holder_document: string;
  bank: string;
  branch_number: string;
  account_number: string;
  account_check_digit: string;
  account_type: 'checking' | 'savings' | '';
}

const initialFormData: PartnerFormData = {
  name: '', email: '', whatsapp: '', cnpj: '',
  company_name: '', trading_name: '', annual_revenue: '',
  cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '',
  holder_name: '', holder_document: '', bank: '', branch_number: '',
  account_number: '', account_check_digit: '', account_type: '',
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

const formatPhone = (value: string) => {
  const c = value.replace(/\D/g, '').slice(0, 11);
  if (c.length <= 2) return c;
  if (c.length <= 7) return `(${c.slice(0, 2)})${c.slice(2)}`;
  return `(${c.slice(0, 2)})${c.slice(2, 7)}-${c.slice(7)}`;
};

const formatCNPJ = (value: string) => {
  const c = value.replace(/\D/g, '').slice(0, 14);
  if (c.length <= 2) return c;
  if (c.length <= 5) return `${c.slice(0, 2)}.${c.slice(2)}`;
  if (c.length <= 8) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5)}`;
  if (c.length <= 12) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8)}`;
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`;
};

const formatCEP = (value: string) => {
  const c = value.replace(/\D/g, '').slice(0, 8);
  if (c.length <= 5) return c;
  return `${c.slice(0, 5)}-${c.slice(5)}`;
};

const formatCurrency = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatBankCode = (value: string) => value.replace(/\D/g, '').slice(0, 3);
const formatBranch = (value: string) => value.replace(/\D/g, '').slice(0, 4);
const formatAccountNumber = (value: string) => value.replace(/\D/g, '').slice(0, 13);
const formatCheckDigit = (value: string) => value.replace(/\D/g, '').slice(0, 1);

export function PartnerModal({ open, onOpenChange, onSave }: PartnerModalProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<PartnerFormData>(initialFormData);

  const steps = ['Informações Básicas', 'Dados da Empresa', 'Endereço', 'Dados Bancários'];

  const handleChange = (field: keyof PartnerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (s: number): boolean => {
    switch (s) {
      case 0:
        if (!formData.name || !formData.email || !formData.whatsapp || !formData.cnpj) {
          toast.error('Preencha todos os campos obrigatórios');
          return false;
        }
        return true;
      case 1:
        if (!formData.company_name || !formData.trading_name || !formData.annual_revenue) {
          toast.error('Preencha todos os campos obrigatórios');
          return false;
        }
        return true;
      case 2:
        return true; // endereço opcional
      case 3:
        if (!formData.holder_name || !formData.holder_document || !formData.bank ||
            !formData.branch_number || !formData.account_number || !formData.account_check_digit ||
            !formData.account_type) {
          toast.error('Preencha todos os campos bancários obrigatórios');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  const handleSubmit = () => {
    if (!validateStep(step)) return;

    const revenueDigits = formData.annual_revenue.replace(/\D/g, '');
    const annualRevenue = revenueDigits ? parseInt(revenueDigits, 10) : 0; // centavos

    onSave({
      name: formData.name,
      email: formData.email,
      metadata: {
        cnpj: formData.cnpj,
        whatsapp: formData.whatsapp,
        company_name: formData.company_name,
        trading_name: formData.trading_name,
        annual_revenue: annualRevenue,
        cep: formData.cep,
        rua: formData.rua,
        numero: formData.numero,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        holder_name: formData.holder_name,
        holder_document: formData.holder_document,
        bank: formData.bank,
        branch_number: formData.branch_number,
        account_number: formData.account_number,
        account_check_digit: formData.account_check_digit,
        account_type: formData.account_type,
      },
    });

    setFormData(initialFormData);
    setStep(0);
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setStep(0);
      setFormData(initialFormData);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Parceiro</DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-1 mb-6">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-1 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 ${
                i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs hidden sm:inline truncate ${i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Básico */}
        {step === 0 && (
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
          </div>
        )}

        {/* Step 1: Empresa */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Fantasia *</Label>
                <Input value={formData.company_name} onChange={e => handleChange('company_name', e.target.value)} placeholder="Tech Soluções" />
              </div>
              <div className="space-y-2">
                <Label>Razão Social *</Label>
                <Input value={formData.trading_name} onChange={e => handleChange('trading_name', e.target.value)} placeholder="Tech Soluções Ltda" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Receita Anual (R$) *</Label>
                <Input
                  value={formData.annual_revenue}
                  onChange={e => handleChange('annual_revenue', formatCurrency(e.target.value))}
                  placeholder="50.000,00"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Endereço */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        )}

        {/* Step 3: Banco */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Titular *</Label>
                <Input value={formData.holder_name} onChange={e => handleChange('holder_name', e.target.value)} placeholder="Tech Soluções Ltda" />
              </div>
              <div className="space-y-2">
                <Label>CNPJ do Titular *</Label>
                <Input value={formData.holder_document} onChange={e => handleChange('holder_document', formatCNPJ(e.target.value))} placeholder="12.345.678/0001-34" />
              </div>
              <div className="space-y-2">
                <Label>Código do Banco *</Label>
                <Input value={formData.bank} onChange={e => handleChange('bank', formatBankCode(e.target.value))} placeholder="001" />
              </div>
              <div className="space-y-2">
                <Label>Agência *</Label>
                <Input value={formData.branch_number} onChange={e => handleChange('branch_number', formatBranch(e.target.value))} placeholder="1234" />
              </div>
              <div className="space-y-2">
                <Label>Número da Conta *</Label>
                <Input value={formData.account_number} onChange={e => handleChange('account_number', formatAccountNumber(e.target.value))} placeholder="12345678" />
              </div>
              <div className="space-y-2">
                <Label>Dígito Verificador *</Label>
                <Input value={formData.account_check_digit} onChange={e => handleChange('account_check_digit', formatCheckDigit(e.target.value))} placeholder="9" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Tipo de Conta *</Label>
                <Select value={formData.account_type} onValueChange={v => handleChange('account_type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Conta Poupança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={() => step === 0 ? handleClose(false) : setStep(s => s - 1)}>
            {step === 0 ? 'Cancelar' : <><ChevronLeft className="h-4 w-4 mr-1" /> Voltar</>}
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit}>Cadastrar Parceiro</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
