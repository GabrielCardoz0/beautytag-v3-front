import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Service, FormServiceOption } from '@/types';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (form: { name: string; description: string; serviceOptions: FormServiceOption[] }) => void;
  services: Service[];
}

export function FormModal({ open, onOpenChange, onSave, services }: FormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [serviceOptions, setServiceOptions] = useState<FormServiceOption[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addServiceOption = () => {
    setServiceOptions(prev => [...prev, { serviceId: 0, secondaryServiceIds: [] }]);
    setExpandedIndex(serviceOptions.length);
  };

  const removeServiceOption = (index: number) => {
    setServiceOptions(prev => prev.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const updateServiceOption = (index: number, serviceId: number) => {
    setServiceOptions(prev => prev.map((opt, i) => 
      i === index ? { ...opt, serviceId, secondaryServiceIds: [] } : opt
    ));
  };

  const toggleSecondaryService = (optionIndex: number, serviceId: number) => {
    setServiceOptions(prev => prev.map((opt, i) => {
      if (i !== optionIndex) return opt;
      const exists = opt.secondaryServiceIds.includes(serviceId);
      return {
        ...opt,
        secondaryServiceIds: exists 
          ? opt.secondaryServiceIds.filter(id => id !== serviceId)
          : [...opt.secondaryServiceIds, serviceId]
      };
    }));
  };

  const getServiceById = (id: number) => services.find(s => s.id === id);

  const getAvailableServices = (currentIndex: number) => {
    const usedServiceIds = serviceOptions
      .filter((_, i) => i !== currentIndex)
      .map(opt => opt.serviceId);
    return services.filter(s => !usedServiceIds.includes(s.id));
  };

  const getSecondaryOptions = (optionIndex: number) => {
    const mainServiceId = serviceOptions[optionIndex]?.serviceId;
    return services.filter(s => s.id !== mainServiceId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Preencha o nome do formulário');
      return;
    }

    const validOptions = serviceOptions.filter(opt => opt.serviceId > 0);
    if (validOptions.length === 0) {
      toast.error('Adicione pelo menos um serviço ao formulário');
      return;
    }

    onSave({
      name: formData.name,
      description: formData.description,
      serviceOptions: validOptions,
    });

    setFormData({ name: '', description: '' });
    setServiceOptions([]);
    setExpandedIndex(null);
    onOpenChange(false);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setServiceOptions([]);
    setExpandedIndex(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); onOpenChange(isOpen); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Formulário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="formName">Nome do Formulário *</Label>
              <Input
                id="formName"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Formulário de Agendamento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formDescription">Descrição do Formulário</Label>
              <Textarea
                id="formDescription"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descrição opcional do formulário..."
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Serviços do Formulário</Label>
              <Button type="button" variant="outline" size="sm" onClick={addServiceOption}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Serviço
              </Button>
            </div>

            {serviceOptions.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-2">Nenhum serviço adicionado</p>
                <Button type="button" variant="ghost" size="sm" onClick={addServiceOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar primeiro serviço
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {serviceOptions.map((option, index) => {
                  const service = getServiceById(option.serviceId);
                  const isExpanded = expandedIndex === index;
                  const secondaryServices = option.secondaryServiceIds.map(id => getServiceById(id)).filter(Boolean);

                  return (
                    <Collapsible 
                      key={index} 
                      open={isExpanded}
                      onOpenChange={(open) => setExpandedIndex(open ? index : null)}
                    >
                      <div className="border rounded-lg overflow-hidden">
                        <div className="p-4 bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <Label className="text-sm text-muted-foreground mb-2 block">Serviço Principal</Label>
                              <Select 
                                value={option.serviceId > 0 ? option.serviceId.toString() : ''} 
                                onValueChange={(value) => updateServiceOption(index, parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um serviço" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableServices(index).map(s => (
                                    <SelectItem key={s.id} value={s.id.toString()}>
                                      {s.name} - R$ {s.price.toFixed(2)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                              <CollapsibleTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" disabled={option.serviceId <= 0}>
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                              </CollapsibleTrigger>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeServiceOption(index)}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          {secondaryServices.length > 0 && !isExpanded && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="text-xs text-muted-foreground">Secundários:</span>
                              {secondaryServices.map(s => s && (
                                <Badge key={s.id} variant="secondary" className="text-xs">
                                  {s.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <CollapsibleContent>
                          <div className="p-4 border-t bg-background">
                            <Label className="text-sm text-muted-foreground mb-3 block">
                              Opções Secundárias (opcional)
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                              {getSecondaryOptions(index).map(s => (
                                <label 
                                  key={s.id}
                                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                >
                                  <Checkbox
                                    checked={option.secondaryServiceIds.includes(s.id)}
                                    onCheckedChange={() => toggleSecondaryService(index, s.id)}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{s.name}</p>
                                    <p className="text-xs text-muted-foreground">R$ {s.price.toFixed(2)}</p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Formulário</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
