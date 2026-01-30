import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, ChevronDown, ChevronUp, Trash2, Loader2 } from 'lucide-react';
import { Service, FormServiceOption, Form, FormSecondaryOption } from '@/types';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { formsApi } from '@/lib/api';

interface FormEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: Form | null;
  services: Service[];
  onSave: (formId: number, data: { name: string; description: string; serviceOptions: FormServiceOption[] }) => void;
}

export function FormEditModal({ open, onOpenChange, form, services, onSave }: FormEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [serviceOptions, setServiceOptions] = useState<FormServiceOption[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [deletingOptionId, setDeletingOptionId] = useState<number | null>(null);
  const [deletingSecondaryId, setDeletingSecondaryId] = useState<number | null>(null);

  useEffect(() => {
    if (form) {
      setFormData({
        name: form.name,
        description: form.description,
      });
      setServiceOptions([...form.serviceOptions]);
    }
  }, [form]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addServiceOption = () => {
    setServiceOptions(prev => [...prev, { optionId: 0, serviceId: 0, secondaryOptions: [] }]);
    setExpandedIndex(serviceOptions.length);
  };

  const removeServiceOption = async (index: number) => {
    const option = serviceOptions[index];
    
    // Se a opção tem um ID real (já existe no servidor), deletar via API
    if (option.optionId > 0) {
      try {
        setDeletingOptionId(option.optionId);
        await formsApi.deleteOption(option.optionId);
        toast.success('Serviço removido do formulário');
      } catch (error) {
        console.error('Error deleting option:', error);
        toast.error('Erro ao remover serviço');
        return;
      } finally {
        setDeletingOptionId(null);
      }
    }
    
    setServiceOptions(prev => prev.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const updateServiceOption = (index: number, serviceId: number) => {
    setServiceOptions(prev => prev.map((opt, i) => 
      i === index ? { ...opt, serviceId, secondaryOptions: [] } : opt
    ));
  };

  const removeSecondaryService = async (optionIndex: number, secondary: FormSecondaryOption) => {
    // Se a opção secundária tem um ID real (já existe no servidor), deletar via API
    if (secondary.id > 0) {
      try {
        setDeletingSecondaryId(secondary.id);
        await formsApi.deleteSecondaryOption(secondary.id);
        toast.success('Opção secundária removida');
      } catch (error) {
        console.error('Error deleting secondary option:', error);
        toast.error('Erro ao remover opção secundária');
        return;
      } finally {
        setDeletingSecondaryId(null);
      }
    }
    
    setServiceOptions(prev => prev.map((opt, i) => {
      if (i !== optionIndex) return opt;
      return {
        ...opt,
        secondaryOptions: opt.secondaryOptions.filter(s => s.serviceId !== secondary.serviceId)
      };
    }));
  };

  const toggleSecondaryService = (optionIndex: number, serviceId: number) => {
    setServiceOptions(prev => prev.map((opt, i) => {
      if (i !== optionIndex) return opt;
      const exists = opt.secondaryOptions.some(s => s.serviceId === serviceId);
      return {
        ...opt,
        secondaryOptions: exists 
          ? opt.secondaryOptions.filter(s => s.serviceId !== serviceId)
          : [...opt.secondaryOptions, { id: 0, serviceId }]
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
    
    if (!form) return;

    if (!formData.name) {
      toast.error('Preencha o nome do formulário');
      return;
    }

    const validOptions = serviceOptions.filter(opt => opt.serviceId > 0);
    if (validOptions.length === 0) {
      toast.error('Adicione pelo menos um serviço ao formulário');
      return;
    }

    onSave(form.id, {
      name: formData.name,
      description: formData.description,
      serviceOptions: validOptions,
    });
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Formulário</DialogTitle>
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
                  const secondaryServices = option.secondaryOptions.map(s => ({
                    ...s,
                    service: getServiceById(s.serviceId)
                  })).filter(s => s.service);

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
                                disabled={option.optionId > 0} // Não pode mudar serviço de opção já existente
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
                                disabled={deletingOptionId === option.optionId}
                              >
                                {deletingOptionId === option.optionId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Mostrar serviços secundários selecionados com opção de remover */}
                          {secondaryServices.length > 0 && !isExpanded && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="text-xs text-muted-foreground">Secundários:</span>
                              {secondaryServices.map(s => s.service && (
                                <Badge 
                                  key={s.serviceId} 
                                  variant="secondary" 
                                  className="text-xs flex items-center gap-1 pr-1"
                                >
                                  {s.service.name}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeSecondaryService(index, s);
                                    }}
                                    disabled={deletingSecondaryId === s.id}
                                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                  >
                                    {deletingSecondaryId === s.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <X className="h-3 w-3" />
                                    )}
                                  </button>
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
                            
                            {/* Serviços secundários selecionados com botão de remover */}
                            {secondaryServices.length > 0 && (
                              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-2">Selecionados:</p>
                                <div className="flex flex-wrap gap-2">
                                  {secondaryServices.map(s => s.service && (
                                    <Badge 
                                      key={s.serviceId} 
                                      variant="default" 
                                      className="flex items-center gap-1 pr-1"
                                    >
                                      {s.service.name} - R$ {s.service.price.toFixed(2)}
                                      <button
                                        type="button"
                                        onClick={() => removeSecondaryService(index, s)}
                                        disabled={deletingSecondaryId === s.id}
                                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                      >
                                        {deletingSecondaryId === s.id ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <X className="h-3 w-3" />
                                        )}
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                              {getSecondaryOptions(index).map(s => (
                                <label 
                                  key={s.id}
                                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                >
                                  <Checkbox
                                    checked={option.secondaryOptions.some(sec => sec.serviceId === s.id)}
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
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}